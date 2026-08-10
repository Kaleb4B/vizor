import React from 'react';

export default function ScoreGauge({ score, type = 'human' }) {
  let color = 'emerald';
  let label = 'Trusted Human';

  if (type === 'human') {
    if (score < 30) { color = 'rose'; label = 'Suspicious'; }
    else if (score < 60) { color = 'amber'; label = 'Possible Bot'; }
    else if (score < 80) { color = 'gold'; label = 'Human Signal'; }
  } else { // bot
    if (score >= 60) { color = 'rose'; label = 'High Bot Risk'; }
    else if (score >= 30) { color = 'amber'; label = 'Moderate Risk'; }
    else { color = 'emerald'; label = 'Low Bot Risk'; }
  }

  const badgeStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    gold: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
    amber: 'bg-orange-500/10 text-orange-300 border-orange-500/30 shadow-sm shadow-orange-500/10',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
  };

  return (
    <div className="flex items-center space-x-2 font-mono">
      <div className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${badgeStyles[color]}`}>
        {score} / 100
      </div>
      <span className="text-[11px] text-amber-200/50 font-sans">{label}</span>
    </div>
  );
}
