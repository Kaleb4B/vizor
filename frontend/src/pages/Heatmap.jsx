import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { heatmapAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Flame, MousePointer, Scroll, Eye } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

export default function Heatmap() {
  const [heatmapType, setHeatmapType] = useState('click');
  const { activeSite } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['heatmap-data', activeSite?.id],
    queryFn: () => heatmapAPI.data(activeSite?.id),
    refetchInterval: 60000,
  });

  const heatmapData = data?.data;
  const points = heatmapData?.points || [];

  // Scale points to canvas size (700x500)
  const scaledPoints = points.slice(0, 80).map(p => ({
    left: `${(p.x * 85 + 7)}%`,
    top: `${(p.y * 85 + 7)}%`,
    intensity: p.value,
    isBot: p.is_bot,
  }));

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            Visual Heatmap
          </h1>
          <p className="text-sm text-amber-200/50 mt-1">
            Click, movement, scroll depth overlays.
            {heatmapData && (
              <span className="ml-2 text-amber-400 font-mono text-xs">
                {heatmapData.total_clicks} total clicks — {heatmapData.human_clicks} human / {heatmapData.bot_clicks} bot
              </span>
            )}
          </p>
        </div>

        <div className="flex bg-slate-950/80 border border-amber-500/20 p-1.5 rounded-xl space-x-1">
          {[
            { id: 'click', label: 'Click', icon: MousePointer },
            { id: 'move', label: 'Move', icon: Flame },
            { id: 'scroll', label: 'Scroll', icon: Scroll },
            { id: 'hover', label: 'Hover', icon: Eye },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setHeatmapType(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  heatmapType === item.id
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 shadow'
                    : 'text-amber-200/50 hover:text-amber-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-4xl bg-slate-950/80 border border-amber-500/15 rounded-2xl p-8 min-h-[500px] relative overflow-hidden">
          {/* Simulated Webpage */}
          <div className="text-center space-y-4 max-w-xl mx-auto relative z-10">
            <span className="text-xs bg-amber-500/15 text-amber-300 font-semibold px-3 py-1 rounded-full border border-amber-500/30">
              {activeSite?.name || 'Taneko Official Store'}
            </span>
            <h2 className="text-3xl font-extrabold text-white">Boost Your ROI with Vizor AI</h2>
            <p className="text-sm text-amber-200/50">Detect bots and fake clicks in sub-50ms before your ad budget gets burned.</p>
            <div className="flex justify-center space-x-4 pt-4">
              <button id="heatmap-cta-primary" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 font-bold rounded-2xl shadow-lg shadow-amber-500/30">
                Start Free Trial
              </button>
              <button className="px-6 py-3 bg-slate-900 text-amber-200/70 font-bold rounded-2xl border border-amber-500/20">
                Book Demo
              </button>
            </div>
          </div>

          {/* Real Heatmap Points from API */}
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-amber-400/60 font-mono text-sm animate-pulse">Loading heatmap data...</div>
            </div>
          ) : (
            heatmapType === 'click' && scaledPoints.map((pt, i) => (
              <div
                key={i}
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: pt.left,
                  top: pt.top,
                  width: `${pt.intensity * 40 + 10}px`,
                  height: `${pt.intensity * 40 + 10}px`,
                  background: pt.isBot
                    ? `radial-gradient(circle, rgba(244,63,94,${pt.intensity * 0.6}) 0%, transparent 70%)`
                    : `radial-gradient(circle, rgba(245,158,11,${pt.intensity * 0.6}) 0%, transparent 70%)`,
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(8px)',
                }}
              />
            ))
          )}

          {heatmapType === 'move' && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent pointer-events-none blur-2xl" />
          )}
          {heatmapType === 'scroll' && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="h-1/3 bg-emerald-500/20 border-b border-emerald-500/30 flex items-center justify-end px-4 text-xs font-mono text-emerald-400 font-bold">100% Reached (Above Fold)</div>
              <div className="h-1/3 bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-end px-4 text-xs font-mono text-amber-400 font-bold">64% Reached</div>
              <div className="h-1/3 bg-rose-500/20 flex items-center justify-end px-4 text-xs font-mono text-rose-400 font-bold">18% Reached</div>
            </div>
          )}
          {heatmapType === 'hover' && (
            <div className="absolute top-[180px] left-[35%] w-80 h-32 bg-amber-500/25 blur-2xl rounded-full pointer-events-none" />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs font-mono">
          <span className="flex items-center gap-2 text-amber-300">
            <span className="w-3 h-3 rounded-full bg-amber-500/70" />
            Human Clicks
          </span>
          <span className="flex items-center gap-2 text-rose-400">
            <span className="w-3 h-3 rounded-full bg-rose-500/70" />
            Bot/Fraud Clicks
          </span>
        </div>
      </div>
    </div>
  );
}
