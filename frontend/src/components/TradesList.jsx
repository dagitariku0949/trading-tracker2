import React, { useState } from 'react'

export default function TradesList({ trades, onEdit, onDelete, onClose, onAfterTrade }) {
  const [filter, setFilter] = useState('ALL') // ALL, OPEN, CLOSED

  const filteredTrades = trades.filter(t => {
    if (filter === 'OPEN') return t.status === 'OPEN'
    if (filter === 'CLOSED') return t.status === 'CLOSED'
    return true
  })

  const handleClose = (trade) => {
    // Open After Trade form with this trade's data
    if (onAfterTrade) {
      onAfterTrade(trade)
    }
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trade History</h2>
        <div className="flex gap-2">
          {['ALL', 'OPEN', 'CLOSED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded ${
                filter === f 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No trades found. Click "New Trade" to add one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                <th className="pb-3">Date</th>
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Direction</th>
                <th className="pb-3">Entry</th>
                <th className="pb-3">Exit</th>
                <th className="pb-3">Lot Size</th>
                <th className="pb-3">P&L</th>
                <th className="pb-3">Confluence</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 text-sm">
                    {new Date(trade.trade_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 font-semibold">{trade.symbol}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.direction === 'LONG' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="py-3">{trade.entry_price}</td>
                  <td className="py-3">{trade.exit_price || '-'}</td>
                  <td className="py-3">{trade.lot_size}</td>
                  <td className="py-3">
                    {trade.pnl ? (
                      <span className={trade.pnl >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${
                      trade.total_confluence >= 70 ? 'text-emerald-400' : 
                      trade.total_confluence >= 40 ? 'text-yellow-400' : 'text-slate-400'
                    }`}>
                      {trade.total_confluence}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.status === 'OPEN' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {trade.status === 'OPEN' && (
                        <button
                          onClick={() => handleClose(trade)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(trade)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(trade.id)}
                        className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
