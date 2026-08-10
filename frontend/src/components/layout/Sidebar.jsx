import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Users,
  MousePointerClick,
  Flame,
  PlayCircle,
  ShieldAlert,
  Bot,
  Smartphone,
  Globe,
  TrendingUp,
  FileText,
  Settings,
  Eye
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live', label: 'Live Visitors', icon: Radio, badge: 'LIVE' },
  { path: '/sessions', label: 'Visitor Sessions', icon: Users },
  { path: '/click-analysis', label: 'Click Analysis', icon: MousePointerClick },
  { path: '/heatmap', label: 'Heatmap', icon: Flame },
  { path: '/replay', label: 'Session Replay', icon: PlayCircle },
  { path: '/fraud-detection', label: 'Fraud Detection', icon: ShieldAlert, highlight: true },
  { path: '/bot-detection', label: 'Bot Detection', icon: Bot },
  { path: '/device-analytics', label: 'Device Analytics', icon: Smartphone },
  { path: '/geo-analytics', label: 'Geo Analytics', icon: Globe },
  { path: '/campaign-analytics', label: 'Campaign Analytics', icon: TrendingUp },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#08090f]/90 backdrop-blur-2xl border-r border-amber-500/15 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-2xl shadow-black/80">
      {/* Brand Header */}
      <div className="p-5 border-b border-amber-500/15 flex items-center space-x-3.5 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
          <Eye className="w-6 h-6 text-amber-950 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-widest gold-gradient-text flex items-center gap-1.5 font-sans">
            VIZOR
            <span className="text-[9px] bg-amber-500/15 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30 tracking-normal">
              AI
            </span>
          </h1>
          <p className="text-[10px] text-amber-200/50 font-medium tracking-wider uppercase font-mono">Cyber Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-transparent text-amber-100 border border-amber-500/30 shadow-lg shadow-amber-500/10 font-semibold'
                    : 'text-slate-400 hover:text-amber-200 hover:bg-amber-500/5 hover:border-amber-500/10 border border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-amber-400/80" />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse-glow">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Engine Status Footer */}
      <div className="p-4 border-t border-amber-500/15 bg-[#06070b]/80 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-amber-200/60 mb-1.5 font-mono">
          <span>Shield Engine</span>
          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-glow" />
            Vigilant
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-amber-500/20">
          <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 h-full w-[96%] shadow-sm shadow-amber-400" />
        </div>
        <p className="text-[10px] text-amber-200/40 mt-2 font-mono">Sub-50ms Neural Rule Mesh</p>
      </div>
    </aside>
  );
}
