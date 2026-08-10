import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fraudAPI } from '../services/api';
import { ShieldAlert, Ban, RefreshCw } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

export default function FraudDetection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['fraud-events'],
    queryFn: () => fraudAPI.list(30),
    refetchInterval: 30000,
  });

  const fraudList = data?.data || [];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            Click Fraud Intelligence
          </h1>
          <p className="text-sm text-amber-200/50 mt-1 font-sans">
            Autonomous protection against click farm bursts, proxy/VPN maskings, and ad-budget drain.
            {' '}
            <span className="text-amber-400 font-mono text-xs">{fraudList.length} threats detected</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-amber-500/20 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="px-5 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-rose-600/25 border border-rose-400/30 transition transform hover:-translate-y-0.5">
            <Ban className="w-4 h-4 stroke-[2.5]" />
            Auto-Mitigate All High Risk
          </button>
        </div>
      </div>

      <div className="glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-rose-400 text-sm font-mono">Failed to load fraud data</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-amber-200/60 uppercase font-semibold font-mono border-b border-amber-500/15">
                <tr>
                  <th className="p-4">Threat IP</th>
                  <th className="p-4">Pattern Signature</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">Click Density</th>
                  <th className="p-4">Masking Signal</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Proxy/Tor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 font-sans">
                {fraudList.map((item, idx) => (
                  <tr key={item.event_id || idx} className="hover:bg-amber-500/5 transition duration-150">
                    <td className="p-4 font-mono font-bold text-amber-300">{item.ip_address}</td>
                    <td className="p-4 font-medium text-amber-100">{item.fraud_type}</td>
                    <td className="p-4 font-bold text-white font-mono">{item.country}</td>
                    <td className="p-4 font-mono text-rose-400 font-bold">{item.click_count} / session</td>
                    <td className="p-4 font-mono">
                      {item.is_vpn || item.is_proxy ? (
                        <span className="text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[11px]">
                          {item.is_vpn ? 'VPN' : ''}{item.is_vpn && item.is_proxy ? ' + ' : ''}{item.is_proxy ? 'PROXY' : ''}
                        </span>
                      ) : (
                        <span className="text-amber-200/40 text-[11px]">Direct Residential</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-extrabold text-rose-400 text-sm">{item.fraud_score} / 100</td>
                    <td className="p-4 font-mono">
                      <span className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.severity === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-4 font-mono">
                      {item.is_tor && (
                        <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">TOR</span>
                      )}
                      {!item.is_tor && (
                        <span className="text-amber-200/30 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
