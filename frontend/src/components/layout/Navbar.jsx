import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, visitorsAPI } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { Globe, Bell, ChevronDown, Radio, ShieldCheck, User } from 'lucide-react';

export default function Navbar() {
  const { activeSite, sites, setActiveSite, period, setPeriod } = useAppStore();
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Fetch real-time live signals count & alerts from API
  const { data: summaryData } = useQuery({
    queryKey: ['navbar-summary', activeSite?.id],
    queryFn: () => dashboardAPI.summary(period, activeSite?.id),
    refetchInterval: 3000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['navbar-alerts'],
    queryFn: () => dashboardAPI.alerts(),
    refetchInterval: 15000,
  });

  const liveCount = summaryData?.data?.live_visitors ?? 0;

  const alerts = alertsData?.data || [];

  return (
    <header className="h-16 bg-[#08090f]/80 backdrop-blur-2xl border-b border-amber-500/15 fixed top-0 right-0 left-64 z-20 px-6 flex items-center justify-between shadow-xl">
      {/* Site Selector */}
      <div className="relative">
        <button
          onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
          className="flex items-center space-x-2.5 px-3.5 py-2 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-sm text-amber-100 font-medium transition duration-200 shadow-sm"
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{activeSite.name}</span>
          <span className="text-xs text-amber-300/50 font-mono">({activeSite.domain})</span>
          <ChevronDown className="w-4 h-4 text-amber-400/70 ml-1" />
        </button>

        {siteDropdownOpen && (
          <div className="absolute left-0 mt-2 w-64 glass-panel border border-amber-500/25 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden backdrop-blur-3xl">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => {
                  setActiveSite(site);
                  setSiteDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition ${
                  activeSite.id === site.id 
                    ? 'bg-amber-500/20 text-amber-200 font-semibold border-l-2 border-amber-400' 
                    : 'text-slate-300 hover:bg-amber-500/10 hover:text-amber-100'
                }`}
              >
                <div>
                  <div className="font-medium">{site.name}</div>
                  <div className="text-xs text-amber-300/40 font-mono">{site.domain}</div>
                </div>
                {activeSite.id === site.id && <ShieldCheck className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Live Visitor Indicator from API */}
        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-300 shadow-sm shadow-amber-500/10">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse-glow" />
          <span className="font-mono">{liveCount} Live Signals</span>
        </div>

        {/* Time Period Selector */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-amber-500/20 text-xs font-medium text-slate-400 font-mono">
          {['1h', '6h', '24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                period === p 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20' 
                  : 'hover:text-amber-200 hover:bg-amber-500/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-200 relative transition"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-rose-400 shadow-md">
                {alerts.length}
              </span>
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel border border-amber-500/25 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/15 mb-3">
                <span className="font-semibold text-sm text-amber-100 font-sans">Anomaly Feed</span>
                <span className="text-xs text-amber-300/50 font-mono">{alerts.length} active</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {alerts.length === 0 ? (
                  <p className="text-xs text-amber-200/40 text-center py-4 font-mono">No active anomaly triggers</p>
                ) : (
                  alerts.map((a, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/20 text-xs">
                      <div className="font-semibold text-rose-300 flex items-center justify-between">
                        <span>{a.type}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{a.timestamp?.slice(11, 16)}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-3 border-l border-amber-500/15 pl-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center font-bold text-xs text-amber-950 shadow-md shadow-amber-500/20 border border-amber-300/40">
            <User className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-xs text-left hidden md:block">
            <div className="font-semibold text-amber-100 font-sans">Cyber Operator</div>
            <div className="text-amber-300/40 text-[10px] font-mono">operator@vizor.ai</div>
          </div>
        </div>
      </div>
    </header>
  );
}
