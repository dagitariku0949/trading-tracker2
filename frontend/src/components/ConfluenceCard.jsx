import React from 'react'

export default function ConfluenceCard({ metrics, trades }) {
  const openTrades = trades.filter(t => t.status === 'OPEN')
  
  const avgByTimeframe = {
    weekly: 0,
    daily: 0,
    h4: 0,
    h1: 0,
    lower: 0
  }

  if (openTrades.length > 0) {
    avgByTimeframe.weekly = Math.round(openTrades.reduce((sum, t) => sum + (t.weekly_tf || 0), 0) / openTrades.length)
    avgByTimeframe.daily = Math.round(openTrades.reduce((sum, t) => sum + (t.daily_tf || 0), 0) / openTrades.length)
    avgByTimeframe.h4 = Math.round(openTrades.reduce((sum, t) => sum + (t.h4_tf || 0), 0) / openTrades.length)
    avgByTimeframe.h1 = Math.round(openTrades.reduce((sum, t) => sum + (t.h1_tf || 0), 0) / openTrades.length)
    avgByTimeframe.lower = Math.round(openTrades.reduce((sum, t) => sum + (t.lower_tf || 0), 0) / openTrades.length)
  }

  const overallScore = Math.round((avgByTimeframe.weekly + avgByTimeframe.daily + avgByTimeframe.h4 + avgByTimeframe.h1 + avgByTimeframe.lower) / 5)
  
  const getConfluenceLevel = (score) => {
    if (score >= 70) return { text: 'High Confluence', color: 'text-emerald-400' }
    if (score >= 40) return { text: 'Medium Confluence', color: 'text-yellow-400' }
    return { text: 'Low Confluence', color: 'text-red-400' }
  }

  const level = getConfluenceLevel(overallScore)

  return (
    <div className="rounded-lg border border-slate-700 p-6 bg-gradient-to-r from-slate-800 to-slate-700">
      <h2 className="text-center text-xl font-semibold mb-4">
        Confluence Summary {openTrades.length > 0 && `(${openTrades.length} Open Trades)`}
      </h2>
      <div className="grid grid-cols-5 gap-4 text-center">
        {[
          { label: 'WEEKLY', value: avgByTimeframe.weekly },
          { label: 'DAILY', value: avgByTimeframe.daily },
          { label: '4H', value: avgByTimeframe.h4 },
          { label: '1H', value: avgByTimeframe.h1 },
          { label: 'LOWER TF', value: avgByTimeframe.lower }
        ].map((tf, i) => (
          <div key={i} className="p-4 rounded bg-slate-900/50"> 
            <div className="text-xs opacity-60 mb-2">{tf.label}</div>
            <div className={`text-2xl font-bold ${tf.value >= 70 ? 'text-emerald-400' : tf.value >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>
              {tf.value}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-6 rounded-lg border-t-2 border-emerald-500 bg-slate-800/40">
        <div className="text-center">
          <div className="text-sm uppercase opacity-70">Total Overall Score</div>
          <div className={`text-6xl font-bold ${level.color}`}>{overallScore}%</div>
          <div className="text-xs opacity-60 mt-2">{level.text}</div>
        </div>
      </div>
    </div>
  )
}
