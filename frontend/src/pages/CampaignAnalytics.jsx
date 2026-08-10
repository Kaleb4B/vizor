import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { TrendingUp } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

export default function CampaignAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-campaign'],
    queryFn: () => analyticsAPI.campaign(),
    refetchInterval: 60000,
  });

  const campaigns = data?.data || [];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-400" />
          Campaign &amp; UTM Intelligence
        </h1>
        <p className="text-sm text-amber-200/50 mt-1">
          Track ad budget waste per campaign source and medium.
          {' '}<span className="text-amber-400 font-mono text-xs">{campaigns.length} active campaigns</span>
        </p>
      </div>

      <div className="glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-rose-400 text-sm font-mono">Failed to load campaign data</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold">Retry</button>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-amber-200/60 uppercase font-semibold font-mono border-b border-amber-500/15">
              <tr>
                <th className="p-4">UTM Campaign</th>
                <th className="p-4">Source / Medium</th>
                <th className="p-4">Visitors</th>
                <th className="p-4">Fraud Clicks</th>
                <th className="p-4">Bot Rate</th>
                <th className="p-4">Conv. Rate</th>
                <th className="p-4">Quality Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 font-sans">
              {campaigns.map((c, idx) => (
                <tr key={idx} className="hover:bg-amber-500/5 transition duration-150">
                  <td className="p-4 font-mono font-bold text-amber-300">{c.utm_campaign}</td>
                  <td className="p-4 text-slate-300 font-mono text-[11px]">
                    <span className="text-amber-400">{c.utm_source}</span> / {c.utm_medium}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200">{c.visitors.toLocaleString()}</td>
                  <td className="p-4 font-mono text-rose-400 font-bold">{c.fraud_clicks.toLocaleString()}</td>
                  <td className="p-4 font-mono">
                    <span className={`font-extrabold ${c.bot_rate > 20 ? 'text-rose-400' : c.bot_rate > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {c.bot_rate}%
                    </span>
                  </td>
                  <td className="p-4 font-mono text-emerald-400 font-bold">{c.conversion_rate}%</td>
                  <td className="p-4 font-mono">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      c.quality_score > 70
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : c.quality_score > 40
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {c.quality_score} / 100
                    </span>
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
