import { useState, useEffect } from 'react'

export default function PositionCalculator({ accountBalance }) {
  const [calcType, setCalcType] = useState('risk') // 'risk' or 'lotsize'
  const [slInputType, setSlInputType] = useState('price') // 'price' or 'pips'
  
  // Risk-based calculator
  const [balance, setBalance] = useState(accountBalance || 10000)
  const [riskPercent, setRiskPercent] = useState(1)
  const [direction, setDirection] = useState('LONG')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [stopLossPips, setStopLossPips] = useState('')
  const [symbol, setSymbol] = useState('EURUSD')
  
  // Results
  const [lotSize, setLotSize] = useState(0)
  const [riskAmount, setRiskAmount] = useState(0)
  const [pipValue, setPipValue] = useState(0)
  const [pipsToSL, setPipsToSL] = useState(0)
  const [takeProfit1, setTakeProfit1] = useState(0)
  const [takeProfit2, setTakeProfit2] = useState(0)
  const [takeProfit3, setTakeProfit3] = useState(0)

  useEffect(() => {
    setBalance(accountBalance || 10000)
  }, [accountBalance])

  const getPipMultiplier = (sym) => {
    const upper = sym.toUpperCase()
    if (upper.includes('JPY')) return 0.01 // JPY pairs
    if (upper.includes('XAU') || upper.includes('GOLD')) return 0.01 // Gold
    if (upper.includes('XAG') || upper.includes('SILVER')) return 0.001 // Silver
    return 0.0001 // Standard forex pairs
  }

  const calculatePosition = () => {
    const entry = parseFloat(entryPrice)
    const bal = parseFloat(balance)
    const risk = parseFloat(riskPercent)

    if (!entry || !bal || !risk) return

    let pips = 0
    let sl = 0

    // Calculate based on input type
    if (slInputType === 'price') {
      sl = parseFloat(stopLoss)
      if (!sl) return
      
      // Calculate pips from price difference
      const pipMultiplier = getPipMultiplier(symbol)
      pips = Math.abs(entry - sl) / pipMultiplier
    } else {
      // Using pips input
      const pipsInput = parseFloat(stopLossPips)
      if (!pipsInput) return
      
      pips = pipsInput
      
      // Calculate stop loss price from pips based on direction
      const pipMultiplier = getPipMultiplier(symbol)
      const priceDistance = pips * pipMultiplier
      
      if (direction === 'LONG') {
        sl = entry - priceDistance
      } else {
        sl = entry + priceDistance
      }
      
      // Update the stopLoss field for display
      setStopLoss(sl.toFixed(5))
    }

    setPipsToSL(pips.toFixed(1))

    // Calculate risk amount
    const riskAmt = (bal * risk) / 100
    setRiskAmount(riskAmt.toFixed(2))

    // Calculate pip value needed
    const pipVal = riskAmt / pips
    setPipValue(pipVal.toFixed(2))

    // Calculate lot size (standard lot = 100,000 units)
    // For standard pairs: 1 standard lot = $10/pip
    // For JPY pairs: 1 standard lot = $9.15/pip (approx)
    let standardPipValue = 10
    if (symbol.toUpperCase().includes('JPY')) {
      standardPipValue = 9.15
    } else if (symbol.toUpperCase().includes('XAU') || symbol.toUpperCase().includes('GOLD')) {
      standardPipValue = 10 // Gold: $10 per 0.01 move per lot
    }

    const lots = pipVal / standardPipValue
    setLotSize(lots.toFixed(2))

    // Calculate take profit levels (1:1, 1:2, 1:3 R:R)
    const tradeDirection = slInputType === 'price' ? (entry > sl ? 'LONG' : 'SHORT') : direction
    const slDistance = Math.abs(entry - sl)
    
    if (tradeDirection === 'LONG') {
      setTakeProfit1((entry + slDistance).toFixed(5))
      setTakeProfit2((entry + slDistance * 2).toFixed(5))
      setTakeProfit3((entry + slDistance * 3).toFixed(5))
    } else {
      setTakeProfit1((entry - slDistance).toFixed(5))
      setTakeProfit2((entry - slDistance * 2).toFixed(5))
      setTakeProfit3((entry - slDistance * 3).toFixed(5))
    }
  }

  // Remove auto-calculation on change
  // useEffect(() => {
  //   calculatePosition()
  // }, [balance, riskPercent, entryPrice, stopLoss, symbol])

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🧮 Position Size Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Trade Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-slate-300">Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="USDJPY">USDJPY</option>
                  <option value="AUDUSD">AUDUSD</option>
                  <option value="USDCAD">USDCAD</option>
                  <option value="XAUUSD">XAUUSD (Gold)</option>
                  <option value="XAGUSD">XAGUSD (Silver)</option>
                  <option value="BTCUSD">BTCUSD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Account Balance ($)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Risk Per Trade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2 mt-2">
                  {[0.5, 1, 1.5, 2].map(val => (
                    <button
                      key={val}
                      onClick={() => setRiskPercent(val)}
                      className={`px-3 py-1 rounded text-xs ${
                        parseFloat(riskPercent) === val
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Trade Direction</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('LONG')}
                    className={`flex-1 px-3 py-2 rounded ${
                      direction === 'LONG'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    🟢 LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('SHORT')}
                    className={`flex-1 px-3 py-2 rounded ${
                      direction === 'SHORT'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    🔴 SHORT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="1.08500"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">Stop Loss Type</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSlInputType('price')}
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      slInputType === 'price'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlInputType('pips')}
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      slInputType === 'pips'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Pips
                  </button>
                </div>

                {slInputType === 'price' ? (
                  <input
                    type="number"
                    step="0.00001"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="1.08000"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={stopLossPips}
                    onChange={(e) => setStopLossPips(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                )}
              </div>

              <button
                onClick={calculatePosition}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                🧮 Calculate Position
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/50 rounded-lg p-4 border border-emerald-700/50">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">📊 Calculated Results</h3>
            
            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-sm text-slate-400">Position Size</div>
                <div className="text-3xl font-bold text-emerald-400">{lotSize} lots</div>
                <div className="text-xs text-slate-500 mt-1">
                  {(lotSize * 100000).toLocaleString()} units
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">Risk Amount</div>
                  <div className="text-xl font-bold text-red-400">${riskAmount}</div>
                </div>

                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">Pips to SL</div>
                  <div className="text-xl font-bold text-yellow-400">{pipsToSL}</div>
                </div>

                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">Pip Value</div>
                  <div className="text-xl font-bold text-blue-400">${pipValue}</div>
                </div>

                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">Direction</div>
                  <div className={`text-xl font-bold ${
                    direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {direction}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Take Profit Levels */}
          {takeProfit1 > 0 && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold mb-3 text-slate-300">🎯 Take Profit Levels</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-800/50 rounded p-2">
                  <span className="text-sm text-slate-400">TP1 (1:1 R:R)</span>
                  <span className="font-semibold text-emerald-400">{takeProfit1}</span>
                  <span className="text-xs text-slate-500">${riskAmount}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 rounded p-2">
                  <span className="text-sm text-slate-400">TP2 (1:2 R:R)</span>
                  <span className="font-semibold text-emerald-400">{takeProfit2}</span>
                  <span className="text-xs text-slate-500">${(riskAmount * 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 rounded p-2">
                  <span className="text-sm text-slate-400">TP3 (1:3 R:R)</span>
                  <span className="font-semibold text-emerald-400">{takeProfit3}</span>
                  <span className="text-xs text-slate-500">${(riskAmount * 3).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <div className="text-xs text-blue-300">
              <div className="font-semibold mb-1">💡 Pro Tips:</div>
              <ul className="space-y-1 text-blue-200/80">
                <li>• Risk 1-2% per trade for consistent growth</li>
                <li>• Always use stop loss to protect capital</li>
                <li>• Consider partial profit taking at TP levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
