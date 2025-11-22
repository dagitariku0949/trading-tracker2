import React, { useState } from 'react'

export default function AfterTradeForm({ trade, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    symbol: trade?.symbol || '',
    direction: trade?.direction || 'LONG',
    pnl: '',
    lot_size: trade?.lot_size || '',
    notes: trade?.notes || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const pnl = parseFloat(formData.pnl)
    const lotSize = parseFloat(formData.lot_size)
    
    // If updating existing trade, preserve its data
    const tradeData = {
      symbol: formData.symbol,
      direction: formData.direction,
      entry_price: trade?.entry_price || 1.0,
      lot_size: lotSize,
      pnl: pnl,
      status: 'CLOSED',
      notes: formData.notes,
      weekly_tf: trade?.weekly_tf || 0,
      daily_tf: trade?.daily_tf || 0,
      h4_tf: trade?.h4_tf || 0,
      h1_tf: trade?.h1_tf || 0,
      lower_tf: trade?.lower_tf || 0
    }
    
    onSubmit(tradeData, trade?.id)
  }

  const isWin = formData.pnl && parseFloat(formData.pnl) > 0

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            📊 {trade ? `Close ${trade.symbol}` : 'After Trade'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              disabled={!!trade}
              placeholder="EURUSD, XAUUSD, etc."
              className={`w-full border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 ${
                trade ? 'bg-slate-700/50 cursor-not-allowed' : 'bg-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Direction</label>
            <select
              name="direction"
              value={formData.direction}
              onChange={handleChange}
              disabled={!!trade}
              className={`w-full border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 ${
                trade ? 'bg-slate-700/50 cursor-not-allowed' : 'bg-slate-700'
              }`}
            >
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Lot Size</label>
            <input
              type="number"
              step="0.01"
              name="lot_size"
              value={formData.lot_size}
              onChange={handleChange}
              required
              disabled={!!trade}
              placeholder="0.01"
              className={`w-full border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 ${
                trade ? 'bg-slate-700/50 cursor-not-allowed' : 'bg-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              P&L (Profit/Loss)
              {formData.pnl && (
                <span className={`ml-2 font-semibold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isWin ? '✓ WIN' : '✗ LOSS'}
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              name="pnl"
              value={formData.pnl}
              onChange={handleChange}
              required
              placeholder="Enter positive for win, negative for loss"
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                formData.pnl 
                  ? isWin 
                    ? 'bg-emerald-900/30 border-emerald-600 focus:border-emerald-500' 
                    : 'bg-red-900/30 border-red-600 focus:border-red-500'
                  : 'bg-slate-700 border-slate-600 focus:border-emerald-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="What happened? Lessons learned..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className={`flex-1 py-2 rounded font-semibold transition ${
                isWin 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isWin ? '✓ Record Win' : '✗ Record Loss'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
