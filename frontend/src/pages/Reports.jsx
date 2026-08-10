import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { FileText, Download, TrendingUp, Bot, ShieldAlert, Globe } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

function MetricCard({ title, value, sub, icon: Icon, color }) {
  const colorMap = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="glass-panel border border-amber-500/20 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorMap[color] || 'text-amber-400'}`} />
        <span className="text-xs text-amber-200/60 font-mono font-semibold uppercase">{title}</span>
      </div>
      <div className={`text-3xl font-extrabold font-sans ${colorMap[color] || 'text-amber-300'}`}>{value}</div>
      {sub && <p className="text-xs text-amber-200/40 mt-1 font-mono">{sub}</p>}
    </div>
  );
}

export default function Reports() {
  const { period } = useAppStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports-summary', period],
    queryFn: () => reportsAPI.summary(period),
    refetchInterval: 60000,
  });

  const report = data?.data;
  const summary = report?.summary;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Reports &amp; Export Center
          </h1>
          <p className="text-sm text-amber-200/50 mt-1">
            Live executive traffic quality summary — period: <span className="text-amber-400 font-mono">{period}</span>
          </p>
        </div>
      </div>

      {/* Live Summary KPIs from API */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Total Visitors" value={(summary.total_visitors || 0).toLocaleString()} sub={`${period} window`} icon={Globe} color="amber" />
          <MetricCard title="Human Rate" value={`${summary.human_rate || 0}%`} sub={`${(summary.human_visitors || 0).toLocaleString()} verified`} icon={TrendingUp} color="emerald" />
          <MetricCard title="Bot Rate" value={`${summary.bot_rate || 0}%`} sub={`${(summary.bot_visitors || 0).toLocaleString()} agents`} icon={Bot} color="rose" />
          <MetricCard title="Fraud Clicks" value={(summary.fraud_clicks || 0).toLocaleString()} sub="blocked threats" icon={ShieldAlert} color="purple" />
        </div>
      ) : null}

      {/* Top Geo */}
      {report?.geo_top5 && (
        <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
          <h2 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            Top 5 Traffic Origins
          </h2>
          <div className="space-y-2">
            {report.geo_top5.map((g, i) => (
              <div key={i} className="flex items-center gap-4 text-xs">
                <span className="w-4 text-amber-200/40 font-mono">{i + 1}</span>
                <span className="w-8 font-mono text-amber-400 font-bold">{g.country}</span>
                <span className="flex-1 text-slate-300">{g.country_name}</span>
                <span className="font-mono text-slate-200 font-bold">{g.visitors.toLocaleString()}</span>
                <span className={`font-mono font-bold ${g.bot_rate > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>{g.bot_rate}% bots</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Click Fraud Executive Audit', desc: 'Comprehensive breakdown of blocked IPs, wasted ad spend, and fraud vectors.', format: 'PDF Report', icon: FileText },
          { title: 'Bot Traffic & Crawler Log', desc: 'Detailed log of automation frameworks, headless browsers, and AI crawlers.', format: 'CSV Export', icon: Bot },
          { title: 'UTM Campaign ROI Summary', desc: 'Conversion quality scores per campaign with recommended budget allocations.', format: 'Excel Package', icon: TrendingUp },
        ].map((r, i) => (
          <div key={i} className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs bg-amber-500/15 text-amber-300 font-mono px-2.5 py-1 rounded border border-amber-500/30">
                {r.format}
              </span>
              <h2 className="text-base font-bold text-white mt-3">{r.title}</h2>
              <p className="text-xs text-amber-200/50 mt-1">{r.desc}</p>
            </div>
            <button className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-amber-950 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5">
              <Download className="w-4 h-4" />
              Generate {r.format}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
