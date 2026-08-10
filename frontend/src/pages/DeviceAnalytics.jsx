import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

const COLORS_DEVICE = ['#f59e0b', '#10b981', '#8b5cf6'];
const COLORS_BROWSER = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DeviceAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-device'],
    queryFn: () => analyticsAPI.device(),
    refetchInterval: 60000,
  });

  const deviceData = (data?.data?.devices || []).map((d, i) => ({
    name: d.type,
    value: d.count,
    color: COLORS_DEVICE[i % COLORS_DEVICE.length],
  }));
  const browserData = (data?.data?.browsers || []).map((b, i) => ({
    name: b.name,
    value: b.count,
    color: COLORS_BROWSER[i % COLORS_BROWSER.length],
  }));
  const osData = data?.data?.os || [];

  const tooltipStyle = {
    backgroundColor: '#0c0e17',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: '12px',
    color: '#fef3c7',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Device &amp; Platform Analytics
        </h1>
        <p className="text-sm text-amber-200/50 mt-1">
          Browser, OS, and hardware distribution of your traffic.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center glass-panel rounded-3xl">
          <p className="text-rose-400 text-sm font-mono">Failed to load device data</p>
          <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel border border-amber-500/20 rounded-3xl p-5 shadow-2xl">
              <h2 className="font-bold text-lg text-white mb-4 font-sans">Device Type Share</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel border border-amber-500/20 rounded-3xl p-5 shadow-2xl">
              <h2 className="font-bold text-lg text-white mb-4 font-sans">Browser Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={browserData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {browserData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* OS Breakdown */}
          <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="font-bold text-lg text-white mb-4 font-sans">Operating System Breakdown</h2>
            <div className="space-y-3">
              {osData.map((os, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-24 text-xs font-mono text-amber-200/70 font-semibold">{os.name}</span>
                  <div className="flex-1 bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                      style={{ width: `${os.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-amber-300 font-bold w-14 text-right">{os.percentage}%</span>
                  <span className="text-xs font-mono text-amber-200/40 w-16 text-right">{os.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
