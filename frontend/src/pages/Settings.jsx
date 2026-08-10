import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sitesAPI, webhooksAPI } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Settings, Copy, Key, Shield, Check, Code, Globe, Bell, Trash2, Plus } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

export default function SettingsPage() {
  const { activeSite, setActiveSite } = useAppStore();
  const [copied, setCopied] = useState(false);

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites-list'],
    queryFn: () => sitesAPI.list(),
  });

  const { data: webhooksData, isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks-list'],
    queryFn: () => webhooksAPI.list(),
  });

  const sites = sitesData?.data || [];
  const webhooks = webhooksData?.data || [];

  const snippet = `<script src="http://localhost:4000/clickguard.js"></script>
<script>
  ClickGuard.init({ websiteId: "${activeSite?.id}", apiKey: "${activeSite?.apiKey || activeSite?.id}" });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          Site &amp; Integration Settings
        </h1>
        <p className="text-sm text-amber-200/50 mt-1">
          Manage site credentials, embed tracking code, and configure webhook alerts.
        </p>
      </div>

      {/* Site List from API */}
      <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" />
          Monitored Sites
        </h2>
        {sitesLoading ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <div className="space-y-3">
            {sites.map(site => (
              <div
                key={site.id}
                onClick={() => setActiveSite(site)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  activeSite?.id === site.id
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-amber-500/10 bg-slate-950/50 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">{site.name}</span>
                    <span className="ml-2 font-mono text-amber-400/70 text-xs">{site.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">{site.plan}</span>
                    {activeSite?.id === site.id && (
                      <span className="text-xs font-mono bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30">ACTIVE</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 font-mono text-xs text-amber-200/40 truncate">{site.apiKey}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Site Config */}
      <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          API &amp; Configuration — {activeSite?.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-amber-200/60 font-semibold font-mono">Website Name</label>
            <input readOnly value={activeSite?.name || ''} className="w-full bg-slate-950/80 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-amber-100 mt-1 font-mono focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-amber-200/60 font-semibold font-mono">Domain</label>
            <input readOnly value={activeSite?.domain || ''} className="w-full bg-slate-950/80 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-amber-100 mt-1 font-mono focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-amber-200/60 font-semibold font-mono">Website ID</label>
          <input readOnly value={activeSite?.id || ''} className="w-full bg-slate-950/80 border border-amber-500/20 rounded-xl px-4 py-2 font-mono text-xs text-amber-400 mt-1 focus:outline-none" />
        </div>
      </div>

      {/* Tracking SDK Snippet */}
      <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            Tracking SDK Snippet
          </h2>
          <button
            onClick={copyToClipboard}
            className="px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <p className="text-xs text-amber-200/50">
          Paste before the closing <code className="text-amber-400">&lt;/head&gt;</code> tag on your landing page.
        </p>
        <pre className="p-4 bg-slate-950/90 border border-amber-500/15 rounded-2xl font-mono text-xs text-amber-300 overflow-x-auto">
          {snippet}
        </pre>
      </div>

      {/* Webhooks from API */}
      <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Webhook Alerts
        </h2>
        {webhooksLoading ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-4 bg-slate-950/80 border border-amber-500/10 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{wh.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                      wh.isActive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {wh.isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-amber-200/40 truncate">{wh.url}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {wh.events.map(e => (
                      <span key={e} className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">{e}</span>
                    ))}
                  </div>
                </div>
                <button className="p-2 text-rose-400/60 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button className="w-full py-3 border border-dashed border-amber-500/30 text-amber-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-500/5 transition">
              <Plus className="w-4 h-4" />
              Add New Webhook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
