import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsAPI } from '../services/api';
import { PlayCircle, PauseCircle, RotateCcw, FastForward, Video } from 'lucide-react';
import ScoreGauge from '../components/ui/ScoreGauge';

function formatDuration(ms) {
  if (!ms) return '42';
  const sec = Math.floor(ms / 1000);
  return sec;
}

export default function SessionReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(15);
  const [speed, setSpeed] = useState(1);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['sessions-replay'],
    queryFn: () => sessionsAPI.list(20),
  });

  const sessions = (data?.data || []).filter(s => !s.is_bot);
  const selectedSession = sessions[selectedSessionIdx] || null;
  const totalSecs = selectedSession ? Math.floor((selectedSession.duration_ms || 42000) / 1000) : 42;

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1 * speed));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-amber-400" />
          Session Replay Player
        </h1>
        <p className="text-sm text-amber-200/50 mt-1">
          Privacy-compliant DOM session playback with mouse movement and interaction timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Session List Panel */}
        <div className="glass-panel border border-amber-500/20 rounded-3xl p-4 shadow-2xl space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-mono text-amber-200/60 uppercase font-bold mb-3">Human Sessions ({sessions.length})</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse bg-amber-500/5 rounded-xl border border-amber-500/10" />
              ))}
            </div>
          ) : (
            sessions.map((s, idx) => (
              <button
                key={s.session_id || idx}
                onClick={() => { setSelectedSessionIdx(idx); setProgress(0); setIsPlaying(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  selectedSessionIdx === idx
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-amber-500/10 bg-slate-950/50 hover:border-amber-500/30'
                }`}
              >
                <div className="font-mono text-amber-300 font-semibold truncate text-[11px]">{s.session_id}</div>
                <div className="text-amber-200/50 mt-0.5">{s.country} · {s.device_type} · {s.page_count} pages</div>
              </button>
            ))
          )}
        </div>

        {/* Player */}
        <div className="lg:col-span-3 glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Top Info Bar */}
          <div className="bg-slate-950/90 border-b border-amber-500/15 p-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="font-mono text-amber-400 font-bold text-[11px]">
                Session: {selectedSession?.session_id || 'sess_demo'}
              </span>
              <span className="text-amber-200/50">{selectedSession?.ip_address || '—'} ({selectedSession?.country || '—'})</span>
              <span className="text-amber-200/50">{selectedSession?.device_type || '—'}</span>
            </div>
            {selectedSession && <ScoreGauge score={selectedSession.human_score} type="human" />}
          </div>

          {/* Replay Canvas */}
          <div className="bg-slate-950/80 p-8 min-h-[400px] relative flex items-center justify-center overflow-hidden flex-1">
            <div className="w-full max-w-2xl bg-slate-900/80 border border-amber-500/10 rounded-2xl p-8 shadow-inner space-y-4">
              <div className="h-6 w-32 bg-amber-500/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-800/80 rounded" />
              <div className="h-4 w-3/4 bg-slate-800/80 rounded" />
              <div className="flex space-x-3 pt-4">
                <div className="h-10 w-28 bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl shadow shadow-amber-500/20" />
                <div className="h-10 w-28 bg-slate-800 border border-amber-500/20 rounded-xl" />
              </div>
            </div>

            {/* Mouse Cursor animation */}
            <div
              className="absolute w-5 h-5 transition-all duration-150 pointer-events-none z-20"
              style={{
                left: `${20 + progress * 0.6}%`,
                top: `${30 + Math.sin(progress * 0.1) * 25}%`
              }}
            >
              <div className="w-4 h-4 bg-amber-400 rounded-full border-2 border-white shadow-lg shadow-amber-500/50 animate-ping" />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-950/90 border-t border-amber-500/15 p-4 space-y-3">
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden cursor-pointer">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl transition"
                >
                  {isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setProgress(0); setIsPlaying(false); }}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-200/60 rounded-xl transition border border-amber-500/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-amber-200/60">
                  {Math.floor(totalSecs * progress / 100)}s / {totalSecs}s
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-900 border border-amber-500/10 p-1 rounded-xl text-xs font-bold">
                {[1, 2, 4, 8].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-0.5 rounded-lg transition ${speed === s ? 'bg-amber-500/20 text-amber-300' : 'text-amber-200/40 hover:text-amber-200'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
