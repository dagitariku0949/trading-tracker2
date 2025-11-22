import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'

export default function EquityCurve({ trades, startingBalance = 100000 }) {
  // Calculate equity curve data
  const getEquityCurveData = () => {
    const closedTrades = trades
      .filter(t => t.status === 'CLOSED')
      .sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date))

    let balance = startingBalance
    const data = [{ date: 'Start', balance: startingBalance, drawdown: 0, peak: startingBalance }]
    let peak = startingBalance

    closedTrades.forEach(trade => {
      balance += parseFloat(trade.pnl) || 0
      peak = Math.max(peak, balance)
      const drawdown = ((peak - balance) / peak) * 100

      data.push({
        date: new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: parseFloat(balance.toFixed(2)),
        drawdown: parseFloat(drawdown.toFixed(2)),
        peak: peak
      })
    })

    return data
  }

  const equityData = getEquityCurveData()
  const currentBalance = equityData[equityData.length - 1]?.balance || startingBalance
  const totalReturn = ((currentBalance - startingBalance) / startingBalance * 100).toFixed(2)
  const maxDrawdown = Math.max(...equityData.map(d => d.drawdown)).toFixed(2)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded shadow-lg">
          <p className="text-sm text-slate-400">{data.date}</p>
          <p className="font-bold text-emerald-400">Balance: ${data.balance.toLocaleString()}</p>
          {data.drawdown > 0 && (
            <p className="text-sm text-red-400">Drawdown: {data.drawdown}%</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Equity Curve</h3>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-slate-400">Total Return: </span>
            <span className={`font-bold ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn}%
            </span>
          </div>
          <div>
            <span className="text-slate-400">Max Drawdown: </span>
            <span className="font-bold text-red-400">{maxDrawdown}%</span>
          </div>
        </div>
      </div>

      {equityData.length > 1 ? (
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={startingBalance} stroke="#64748b" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-500">
          No equity data yet. Add some trades to see your equity curve.
        </div>
      )}
    </div>
  )
}
