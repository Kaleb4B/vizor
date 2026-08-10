import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import StatCard from '../components/ui/StatCard';
import {
  Users, UserCheck, Bot, ShieldAlert, Clock,
  TrendingUp, Percent, Activity, Flame, Zap, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="glass-panel border border-amber-500/10 rounded-3xl p-6 animate-pulse space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export default function Dashboard() {
  const { period, activeSite } = useAppStore();
  const navigate = useNavigate();

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary', period, activeSite?.id],
    queryFn: () => dashboardAPI.summary(period, activeSite?.id),
    refetchInterval: 3000,
  });

  const { data: timeseriesData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-timeseries', period, activeSite?.id],
    queryFn: () => dashboardAPI.timeseries(period, activeSite?.id),
    refetchInterval: 5000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => dashboardAPI.alerts(),
    refetchInterval: 15000,
  });

  const summary = summaryData?.data;
  const chartPoints = (timeseriesData?.data || []).map(d => ({
    time: d.hour,
    Human: d.human,
    Bot: d.bot,
    Fraud: d.fraud,
  }));
  const recentAlerts = alertsData?.data?.slice(0, 6) || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden glass-panel border border-amber-500/25 p-7 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs bg-amber-500/15 text-amber-300 font-mono px-3 py-1 rounded-full border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Autonomous Neural Shield
              </span>
              <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-300 font-mono px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse-glow">
                ● Shield Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
              Traffic Quality &amp; Fraud Intelligence
            </h1>
            <p className="text-sm text-amber-100/60 mt-1 max-w-2xl">
              Continuous multi-dimensional behavioral scoring with sub-50ms rule resolution across global traffic nodes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/live')}
              className="px-5 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-bold rounded-2xl shadow-xl shadow-amber-500/20 transition-all duration-200 text-sm flex items-center gap-2 border border-amber-300/40 transform hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4 stroke-[2.5]" />
              Stream Live Matrix
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Visitors" value={formatNum(summary?.total_visitors || 0)} subtext={`Last ${period} traffic`} trend={summary?.trends?.total_visitors} icon={Users} color="gold" />
          <StatCard title="Human Rate" value={formatNum(summary?.human_visitors || 0)} subtext={`${summary?.human_rate || 0}% Verified Human`} trend={summary?.trends?.human_visitors} icon={UserCheck} color="emerald" />
          <StatCard title="Bot Activity" value={formatNum(summary?.bot_visitors || 0)} subtext={`${summary?.bot_rate || 0}% Automated Agents`} trend={summary?.trends?.bot_visitors ? -summary.trends.bot_visitors : 0} icon={Bot} color="amber" />
          <StatCard title="Fraud Threats" value={formatNum(summary?.fraud_clicks || 0)} subtext="Blocked Invasions" trend={summary?.trends?.fraud_clicks ? -summary.trends.fraud_clicks : 0} icon={ShieldAlert} color="rose" />
        </div>
      )}

      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Bounce Rate" value={`${summary?.bounce_rate || 0}%`} subtext="Optimized retention pattern" trend={summary?.trends?.bounce_rate} icon={Percent} color="amber" />
          <StatCard title="Avg Session Duration" value={`${Math.floor((summary?.avg_session_seconds || 0) / 60)}m ${(summary?.avg_session_seconds || 0) % 60}s`} subtext="High attention depth" trend={4.5} icon={Clock} color="emerald" />
          <StatCard title="Click Quality Score" value={`${summary?.click_quality_avg || 0} / 100`} subtext="Predicted High Quality" trend={6.1} icon={TrendingUp} color="purple" />
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl text-white font-sans flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Traffic Composition Stream ({period})
              </h2>
              <p className="text-xs text-amber-200/50 font-mono">Real-time classification telemetry</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Human
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Bot
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Fraud
              </span>
            </div>
          </div>
          <div className="h-80">
            {chartLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints}>
                  <defs>
                    <linearGradient id="colorHumanWarm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBotWarm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFraudWarm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26201a" />
                  <XAxis dataKey="time" stroke="#786c5e" fontSize={11} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#786c5e" fontSize={11} fontFamily="JetBrains Mono" />
                  <Tooltip contentStyle={{ backgroundColor: '#0c0e17', borderColor: 'rgba(245, 158, 11, 0.25)', borderRadius: '12px', color: '#fef3c7', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)' }} />
                  <Area type="monotone" dataKey="Human" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHumanWarm)" />
                  <Area type="monotone" dataKey="Bot" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBotWarm)" />
                  <Area type="monotone" dataKey="Fraud" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFraudWarm)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Live Threat Feed */}
        <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-amber-500/15 pb-4">
            <h2 className="font-bold text-lg text-white flex items-center gap-2 font-sans">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Threat Neutralization
            </h2>
            <span className="text-xs bg-rose-500/15 text-rose-400 font-mono font-bold px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 font-mono">
            {recentAlerts.length === 0 ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              recentAlerts.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/80 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all duration-200">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-amber-300 font-mono">{item.type}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md border text-[11px] ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-amber-200/50 mt-2 font-sans">
                    <span className="line-clamp-1">{item.message}</span>
                    <span className="text-[10px] font-mono ml-2 shrink-0">
                      {item.acknowledged ? '✓ ACK' : '● NEW'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
