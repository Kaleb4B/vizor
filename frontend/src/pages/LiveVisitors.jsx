import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { visitorsAPI } from '../services/api';
import { Radio, Search, RefreshCw } from 'lucide-react';
import ScoreGauge from '../components/ui/ScoreGauge';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

function formatDwell(ms) {
  if (!ms) return '—';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export default function LiveVisitors() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['live-visitors'],
    queryFn: () => visitorsAPI.list(),
    refetchInterval: 5000, // Auto-refresh every 5s
  });

  const visitors = data?.data || [];
  // Active Signals = total unique rows returned from the live feed
  const activeSignalCount = visitors.length;

  const filtered = visitors.filter(v => {
    if (filter === 'HUMAN' && (v.is_bot || v.is_fraud)) return false;
    if (filter === 'BOT' && !v.is_bot) return false;
    if (filter === 'FRAUD' && !v.is_fraud) return false;
    if (search && !v.ip_address?.includes(search) && !v.current_page?.includes(search) && !v.country?.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            Live Visitors Feed
            <span className="flex items-center gap-1.5 text-xs bg-amber-500/15 text-amber-300 font-mono font-bold px-3 py-1 rounded-full border border-amber-500/30 animate-pulse-glow">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              {activeSignalCount} Active Signals
            </span>
          </h1>
          <p className="text-sm text-amber-200/50 mt-1 font-sans">
            Real-time visitor telemetry stream — auto-refreshes every 10 seconds.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-amber-500/20 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Now
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel border border-amber-500/20 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 w-full sm:w-auto font-mono">
          {['ALL', 'HUMAN', 'BOT', 'FRAUD'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition duration-200 ${
                filter === f
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 border border-amber-500/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search IP, page, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/50 font-mono"
          />
        </div>
      </div>

      {/* Visitors Table */}
      <div className="glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-amber-200/60 uppercase font-semibold font-mono border-b border-amber-500/15">
                <tr>
                  <th className="p-4">Visitor IP</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Active Page</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Trust Score</th>
                  <th className="p-4">Shield Status</th>
                  <th className="p-4">Dwell Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 font-sans">
                {filtered.map((v, idx) => (
                  <tr key={`${v.session_id || 'sess'}-${idx}`} className="hover:bg-amber-500/5 transition duration-150">
                    <td className="p-4 font-mono font-semibold text-amber-300">{v.ip_address}</td>
                    <td className="p-4 font-medium">
                      <span className="text-white">{v.country}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{v.device_type}</td>
                    <td className="p-4 font-mono text-amber-100">{v.current_page}</td>
                    <td className="p-4 capitalize text-slate-400 font-mono">{v.source}</td>
                    <td className="p-4">
                      <ScoreGauge score={v.human_score} type="human" />
                    </td>
                    <td className="p-4">
                      {v.is_fraud ? (
                        <span className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30 text-[11px] font-mono shadow-sm">
                          FRAUD THREAT
                        </span>
                      ) : v.is_bot ? (
                        <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 text-[11px] font-mono shadow-sm">
                          BOT AGENT
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 text-[11px] font-mono shadow-sm">
                          VERIFIED SAFE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-amber-200/50 font-mono text-[11px]">{formatDwell(v.time_on_page_ms)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-amber-200/40 font-mono">No visitors match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
