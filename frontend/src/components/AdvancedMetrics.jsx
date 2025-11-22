import React from 'react'

export default function AdvancedMetrics({ trades, startingBalance = 100000 }) {
  const closedTrades = trades.filter(t => t.status === 'CLOSED')
  
  if (closedTrades.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Metrics</h3>
        <div className="text-center text-slate-500 py-8">
          No closed trades yet. Metrics will appear after you close some trades.
        </div>
      </div>
    )
  }

  // Calculate metrics
  const wins = closedTrades.filter(t => t.pnl > 0)
  const losses = closedTrades.filter(t => t.pnl < 0)
  
  const totalPnL = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0)
  const currentBalance = startingBalance + totalPnL
  
  // Max Drawdown
  let balance = startingBalance
  let peak = startingBalance
  let maxDrawdown = 0
  
  closedTrades.sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date)).forEach(trade => {
    balance += parseFloat(trade.pnl) || 0
    peak = Math.max(peak, balance)
    const drawdown = ((peak - balance) / peak) * 100
    maxDrawdown = Math.max(maxDrawdown, drawdown)
  })

  // Sharpe Ratio (simplified)
  const returns = []
  let prevBalance = startingBalance
  closedTrades.forEach(trade => {
    const pnl = parseFloat(trade.pnl) || 0
    const returnPct = (pnl / prevBalance) * 100
    returns.push(returnPct)
    prevBalance += pnl
  })
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : 0

  // Expectancy
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0
  const winRate = (wins.length / closedTrades.length)
  const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss)

  // Recovery Factor
  const recoveryFactor = maxDrawdown > 0 ? (totalPnL / (startingBalance * maxDrawdown / 100)).toFixed(2) : 0

  // Consecutive wins/losses
  let maxConsecWins = 0
  let maxConsecLosses = 0
  let currentWinStreak = 0
  let currentLossStreak = 0
  
  closedTrades.forEach(trade => {
    if (trade.pnl > 0) {
      currentWinStreak++
      currentLossStreak = 0
      maxConsecWins = Math.max(maxConsecWins, currentWinStreak)
    } else if (trade.pnl < 0) {
      currentLossStreak++
      currentWinStreak = 0
      maxConsecLosses = Math.max(maxConsecLosses, currentLossStreak)
    }
  })

  // Best/Worst Day
  const dailyPnL = {}
  closedTrades.forEach(trade => {
    const date = new Date(trade.trade_date).toDateString()
    dailyPnL[date] = (dailyPnL[date] || 0) + (parseFloat(trade.pnl) || 0)
  })
  
  const dailyPnLValues = Object.values(dailyPnL)
  const bestDay = dailyPnLValues.length > 0 ? Math.max(...dailyPnLValues) : 0
  const worstDay = dailyPnLValues.length > 0 ? Math.min(...dailyPnLValues) : 0

  const metrics = [
    { 
      label: 'Sharpe Ratio', 
      value: sharpeRatio, 
      description: 'Risk-adjusted return',
      color: sharpeRatio > 1 ? 'text-emerald-400' : sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'
    },
    { 
      label: 'Max Drawdown', 
      value: `${maxDrawdown.toFixed(2)}%`, 
      description: 'Largest peak-to-trough decline',
      color: maxDrawdown < 10 ? 'text-emerald-400' : maxDrawdown < 20 ? 'text-yellow-400' : 'text-red-400'
    },
    { 
      label: 'Recovery Factor', 
      value: recoveryFactor, 
      description: 'Profit / Max Drawdown',
      color: recoveryFactor > 3 ? 'text-emerald-400' : recoveryFactor > 1 ? 'text-yellow-400' : 'text-red-400'
    },
    { 
      label: 'Expectancy', 
      value: `$${expectancy.toFixed(2)}`, 
      description: 'Average expected profit per trade',
      color: expectancy > 0 ? 'text-emerald-400' : 'text-red-400'
    },
    { 
      label: 'Best Day', 
      value: `$${bestDay.toFixed(2)}`, 
      description: 'Highest daily profit',
      color: 'text-emerald-400'
    },
    { 
      label: 'Worst Day', 
      value: `$${worstDay.toFixed(2)}`, 
      description: 'Largest daily loss',
      color: 'text-red-400'
    },
    { 
      label: 'Max Win Streak', 
      value: maxConsecWins, 
      description: 'Consecutive winning trades',
      color: 'text-emerald-400'
    },
    { 
      label: 'Max Loss Streak', 
      value: maxConsecLosses, 
      description: 'Consecutive losing trades',
      color: 'text-red-400'
    },
  ]

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Advanced Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">{metric.label}</div>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-slate-500 mt-1">{metric.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
