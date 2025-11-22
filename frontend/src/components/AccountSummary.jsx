import React from 'react'

export default function AccountSummary({ stats }) {
  const profitPercent = ((stats.currentBalance - stats.startingBalance) / stats.startingBalance * 100).toFixed(2)
  const isProfit = stats.currentBalance >= stats.startingBalance

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-sm text-slate-400 mb-1">Starting Balance</div>
          <div className="text-2xl font-bold">${stats.startingBalance.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-1">Current Balance</div>
          <div className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            ${stats.currentBalance.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-1">Total P&L</div>
          <div className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{(stats.currentBalance - stats.startingBalance).toLocaleString()} 
            <span className="text-sm ml-2">({profitPercent}%)</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-1">Total Trades</div>
          <div className="text-2xl font-bold">
            {stats.totalTrades}
            <span className="text-sm ml-2 text-emerald-400">{stats.winningTrades}W</span>
            <span className="text-sm ml-1 text-red-400">{stats.losingTrades}L</span>
          </div>
        </div>
      </div>
    </div>
  )
}
