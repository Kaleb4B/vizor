import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsAPI } from '../services/api';
import { PlayCircle } from 'lucide-react';
import ScoreGauge from '../components/ui/ScoreGauge';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

function formatDuration(ms) {
  if (!ms) return '—';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export default function VisitorSessions() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['visitor-sessions'],
    queryFn: () => sessionsAPI.list(50),
    refetchInterval: 30000,
  });

  const sessions = data?.data || [];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Visitor Sessions Explorer
          </h1>
          <p className="text-sm text-amber-200/50 mt-1">
            Detailed session log with scroll depth, click counts, and replay triggers.
            {' '}<span className="text-amber-400 font-mono text-xs">{sessions.length} sessions</span>
          </p>
        </div>
      </div>

      <div className="glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-rose-400 text-sm font-mono">Failed to load sessions</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold">Retry</button>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-amber-200/60 uppercase font-semibold font-mono border-b border-amber-500/15">
              <tr>
                <th className="p-4">Session ID</th>
                <th className="p-4">IP / Country</th>
                <th className="p-4">Pages</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">Max Scroll</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Human Score</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 font-sans">
              {sessions.map((s, idx) => (
                <tr key={`${s.session_id || 'sess'}-${idx}`} className="hover:bg-amber-500/5 transition duration-150">
                  <td className="p-4 font-mono font-medium text-amber-300 text-[11px]">{s.session_id}</td>
                  <td className="p-4 font-mono text-slate-300">
                    {s.ip_address} <span className="text-amber-400">({s.country})</span>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{s.page_count} pages</td>
                  <td className="p-4 font-bold text-slate-200">{s.click_count} clicks</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${s.scroll_max_depth}%` }} />
                      </div>
                      <span className="font-mono text-[11px]">{s.scroll_max_depth}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-amber-200/60">{formatDuration(s.duration_ms)}</td>
                  <td className="p-4"><ScoreGauge score={s.human_score} type="human" /></td>
                  <td className="p-4">
                    {s.is_bot ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 text-[11px] font-mono">BOT</span>
                    ) : s.is_fraud ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30 text-[11px] font-mono">FRAUD</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 text-[11px] font-mono">SAFE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
