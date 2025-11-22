import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

export default function CalendarHeatmap({ data }) {
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pnl: d.pnl
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded shadow-lg">
          <p className="text-sm">{payload[0].payload.date}</p>
          <p className={`font-bold ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 rounded bg-slate-800/60 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Daily P&L</h3>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500">
          No trading data yet
        </div>
      ) : (
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
