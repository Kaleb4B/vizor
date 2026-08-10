import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { Globe } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

export default function GeoAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-geo'],
    queryFn: () => analyticsAPI.geo(),
    refetchInterval: 60000,
  });

  const geoList = data?.data || [];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-amber-400" />
            Geographic Intelligence
          </h1>
          <p className="text-sm text-amber-200/50 mt-1">
            Country traffic breakdown with localized bot rates.
          </p>
        </div>
      </div>

      <div className="glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-rose-400 text-sm font-mono">Failed to load geo data</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold">Retry</button>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-amber-200/60 uppercase font-semibold font-mono border-b border-amber-500/15">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Country</th>
                <th className="p-4">Total Visitors</th>
                <th className="p-4">Bot Visitors</th>
                <th className="p-4">Fraud Clicks</th>
                <th className="p-4">Bot Share</th>
                <th className="p-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 font-sans">
              {geoList.map((g, idx) => (
                <tr key={g.country || idx} className="hover:bg-amber-500/5 transition duration-150">
                  <td className="p-4 text-amber-200/40 font-mono">{idx + 1}</td>
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <span className="w-8 font-mono text-amber-400 text-xs">{g.country}</span>
                    <span>{g.country_name}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200">{g.visitors.toLocaleString()}</td>
                  <td className="p-4 font-mono text-amber-400 font-bold">{g.bots.toLocaleString()}</td>
                  <td className="p-4 font-mono text-rose-400 font-bold">{g.fraud.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${g.bot_rate > 20 ? 'bg-rose-500' : g.bot_rate > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, g.bot_rate * 3)}%` }}
                        />
                      </div>
                      <span className="font-mono font-extrabold text-amber-300">{g.bot_rate}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      g.bot_rate > 20 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      g.bot_rate > 10 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {g.bot_rate > 20 ? 'HIGH RISK' : g.bot_rate > 10 ? 'MODERATE' : 'LOW RISK'}
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
