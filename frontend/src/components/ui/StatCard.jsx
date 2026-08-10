import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtext, trend, icon: Icon, color = 'amber' }) {
  const isPositive = trend > 0;

  const colorStyles = {
    amber: {
      bg: 'from-amber-500/20 via-amber-600/10 to-transparent border-amber-500/30 text-amber-300',
      glow: 'group-hover:shadow-amber-500/10'
    },
    emerald: {
      bg: 'from-emerald-500/20 via-teal-600/10 to-transparent border-emerald-500/30 text-emerald-300',
      glow: 'group-hover:shadow-emerald-500/10'
    },
    gold: {
      bg: 'from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/30 text-yellow-300',
      glow: 'group-hover:shadow-yellow-500/10'
    },
    rose: {
      bg: 'from-rose-500/20 via-red-600/10 to-transparent border-rose-500/30 text-rose-300',
      glow: 'group-hover:shadow-rose-500/10'
    },
    purple: {
      bg: 'from-purple-500/20 via-violet-600/10 to-transparent border-purple-500/30 text-purple-300',
      glow: 'group-hover:shadow-purple-500/10'
    },
    cyan: {
      bg: 'from-amber-500/20 via-orange-600/10 to-transparent border-amber-500/30 text-amber-300',
      glow: 'group-hover:shadow-amber-500/10'
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.amber;

  return (
    <div className={`glass-panel rounded-2xl p-5 border border-amber-500/15 hover:border-amber-500/35 transition-all duration-300 shadow-xl relative overflow-hidden group ${currentStyle.glow}`}>
      {/* Soft warm light beam overlay on hover */}
      <div className="absolute -right-12 -top-12 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/60 font-mono">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-sans">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br border ${currentStyle.bg} shadow-lg backdrop-blur-md`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs relative z-10">
        {subtext && <span className="text-slate-400 font-medium text-[11px]">{subtext}</span>}
        {trend !== undefined && (
          <span
            className={`flex items-center font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" /> : <TrendingDown className="w-3 h-3 mr-1 text-rose-400" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
