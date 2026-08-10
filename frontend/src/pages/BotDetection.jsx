import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { botsAPI } from '../services/api';
import { Bot, Terminal, RefreshCw } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10 ${className}`} />;
}

export default function BotDetection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bot-events'],
    queryFn: () => botsAPI.list(25),
    refetchInterval: 30000,
  });

  const botList = data?.data || [];
  const totalBots = botList.length;
  const headlessBots = botList.filter(b => b.bot_type?.toLowerCase().includes('chrome') || b.bot_type?.toLowerCase().includes('puppeteer') || b.bot_type?.toLowerCase().includes('selenium')).length;
  const aiCrawlers = botList.filter(b => b.bot_type?.toLowerCase().includes('bot') || b.bot_type?.toLowerCase().includes('claude') || b.bot_type?.toLowerCase().includes('gpt')).length;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            <Bot className="w-7 h-7 text-amber-400" />
            Bot Detection &amp; Rule Engine
          </h1>
          <p className="text-sm text-amber-200/50 mt-1 font-sans">
            Autonomous headless browser detection, CDP automation fingerprinting, and granular AI crawler governance.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-amber-500/20 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
              <div className="text-xs text-amber-200/60 font-mono font-semibold uppercase">Total Bots Detected</div>
              <div className="text-3xl font-extrabold gold-gradient-text mt-2 font-sans">{totalBots.toLocaleString()}</div>
              <p className="text-xs text-amber-200/50 mt-2 font-mono">in current detection window</p>
            </div>
            <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
              <div className="text-xs text-amber-200/60 font-mono font-semibold uppercase">Headless Browsers</div>
              <div className="text-3xl font-extrabold text-amber-300 mt-2 font-sans">{headlessBots}</div>
              <p className="text-xs text-amber-200/50 mt-2 font-mono">Puppeteer &amp; Selenium CDP fingerprints</p>
            </div>
            <div className="glass-panel border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
              <div className="text-xs text-amber-200/60 font-mono font-semibold uppercase">AI Crawlers</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-sans">{aiCrawlers}</div>
              <p className="text-xs text-amber-200/50 mt-2 font-mono">GPTBot, ClaudeBot, Perplexity</p>
            </div>
          </>
        )}
      </div>

      {/* Bot Events Table */}
      <div className="glass-panel border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 bg-slate-950/90 border-b border-amber-500/15 font-bold text-base text-amber-100 font-sans flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          Detected Bot Agents (Live Feed)
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-rose-400 text-sm font-mono">Failed to load bot data</p>
            <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-amber-200/60 uppercase font-semibold font-mono border-b border-amber-500/15">
                <tr>
                  <th className="p-4">Bot IP</th>
                  <th className="p-4">Bot Type</th>
                  <th className="p-4">Detection Flags</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">Bot Score</th>
                  <th className="p-4">Requests</th>
                  <th className="p-4">Datacenter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 font-sans">
                {botList.map((bot, idx) => (
                  <tr key={`${bot.event_id || bot.ip_address}-${idx}`} className="hover:bg-amber-500/5 transition duration-150">
                    <td className="p-4 font-mono font-semibold text-amber-300">{bot.ip_address}</td>
                    <td className="p-4 font-medium text-amber-100">{bot.bot_type}</td>
                    <td className="p-4 font-mono text-rose-300 text-[11px]">{bot.detection_flags}</td>
                    <td className="p-4 font-bold text-white font-mono">{bot.country}</td>
                    <td className="p-4 font-mono font-extrabold text-rose-400">{bot.bot_score} / 100</td>
                    <td className="p-4 font-mono text-amber-200/80">{bot.request_count}</td>
                    <td className="p-4 font-mono">
                      {bot.is_datacenter ? (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30 text-[11px]">DC HOST</span>
                      ) : (
                        <span className="text-amber-200/30 text-[11px]">Residential</span>
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
