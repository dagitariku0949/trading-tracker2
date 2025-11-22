import React from 'react'

export default function MetricsGrid({ metrics }) {
  const items = [
    { title: 'Profit Factor', value: metrics.profitFactor, color: metrics.profitFactor >= 2 ? 'text-emerald-400' : 'text-yellow-400' },
    { title: 'Win Rate', value: `${metrics.winRate}%`, color: metrics.winRate >= 50 ? 'text-emerald-400' : 'text-red-400' },
    { title: 'Avg Confluence', value: `${metrics.avgConfluence}%`, color: metrics.avgConfluence >= 50 ? 'text-emerald-400' : 'text-yellow-400' },
    { title: 'Avg Win', value: `$${metrics.avgWin}`, color: 'text-emerald-400' },
    { title: 'Avg Loss', value: `$${metrics.avgLoss}`, color: 'text-red-400' },
    { title: 'Largest Win', value: `$${metrics.largestWin}`, color: 'text-emerald-400' },
    { title: 'Largest Loss', value: `$${metrics.largestLoss}`, color: 'text-red-400' },
    { title: 'Open Trades', value: metrics.openTrades, color: 'text-blue-400' },
  ]
  
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.title} className="p-4 rounded shadow bg-slate-800/60 border border-slate-700">
          <div className="text-sm opacity-70 mb-1">{it.title}</div>
          <div className={`text-2xl font-semibold ${it.color}`}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}
