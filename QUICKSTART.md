# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Start Backend
Open a terminal and run:
```bash
cd backend
npm start
```
✅ You should see: `Server listening on 4000`

### Step 2: Start Frontend
Open another terminal and run:
```bash
cd frontend
npm run dev
```
✅ You should see: `Local: http://localhost:5173/`

### Step 3: Open Browser
Go to: **http://localhost:5173**

---

## 📝 Your First Trade

1. Click **"+ New Trade"** (top right)

2. Fill in the form:
   ```
   Symbol: EURUSD
   Direction: LONG
   Entry Price: 1.0850
   Lot Size: 1.0
   
   Confluence Scores:
   - Weekly: 80
   - Daily: 70
   - 4H: 60
   - 1H: 50
   - Lower: 40
   ```

3. Click **"Create Trade"**

4. You'll see:
   - Trade appears in the list
   - Confluence card updates
   - Metrics update
   - Account shows 1 open trade

5. To close the trade:
   - Click **"Close"** button
   - Enter exit price: `1.0900`
   - P&L is calculated automatically!

---

## 🎯 Understanding Your Dashboard

### Top Section - Account Summary
- **Starting Balance**: $100,000 (default)
- **Current Balance**: Updates with each closed trade
- **Total P&L**: Your profit/loss with percentage
- **Total Trades**: Win/Loss breakdown

### Confluence Card
Shows average confluence across all **open trades**:
- 🟢 **70%+** = High Confluence (strong setup)
- 🟡 **40-69%** = Medium Confluence
- 🔴 **<40%** = Low Confluence

### Metrics Grid (Left Side)
- **Profit Factor**: Gross profit ÷ Gross loss (aim for 2.0+)
- **Win Rate**: % of winning trades (aim for 50%+)
- **Avg Confluence**: Your average trade quality
- **Avg Win/Loss**: Average profit and loss per trade
- **Largest Win/Loss**: Best and worst trades
- **Open Trades**: Currently active positions

### Daily P&L Chart (Right Side)
- Green bars = Profitable days
- Red bars = Loss days
- Shows your daily performance over time

### Trade List (Bottom)
- **Filter**: ALL / OPEN / CLOSED
- **Actions**: Close, Edit, Delete
- **Status**: Color-coded (Blue = Open, Gray = Closed)

---

## 💡 Pro Tips

### Confluence Scoring
Rate each timeframe based on:
- Trend alignment
- Support/resistance levels
- Indicators (RSI, MACD, etc.)
- Chart patterns
- Volume

**Example High Confluence Trade**:
```
Weekly: 90% - Strong uptrend, above key MA
Daily: 85% - Bullish engulfing at support
4H: 80% - Break and retest of resistance
1H: 75% - Higher highs and higher lows
Lower: 70% - Entry at pullback zone
→ Total: 80% (High Confluence)
```

### Risk Management
- Use the Risk:Reward field to track your RR ratio
- Aim for minimum 1:2 (risk $100 to make $200)
- Track your largest loss to manage drawdown

### Trade Journal
- Use the Notes field to document:
  - Why you took the trade
  - What you saw on the charts
  - Your emotions
  - Lessons learned

---

## 🔧 Troubleshooting

**Backend won't start?**
- Make sure Node.js is installed: `node --version`
- Check if port 4000 is available
- Delete `node_modules` and run `npm install` again

**Frontend won't start?**
- Check if port 5173 is available
- Clear browser cache
- Try: `npm install` then `npm run dev`

**Can't see trades?**
- Check browser console (F12) for errors
- Verify backend is running on port 4000
- Check Network tab to see if API calls are working

**P&L not calculating?**
- Make sure you entered both entry and exit prices
- Check that lot size is a number
- Verify direction is correct (LONG/SHORT)

---

## 📊 Sample Data

Want to test with sample trades? Here are some examples:

**Winning Trade**:
```
Symbol: XAUUSD
Direction: LONG
Entry: 2000.00
Exit: 2050.00
Lot Size: 0.1
Confluence: 75%
→ P&L: +$5.00
```

**Losing Trade**:
```
Symbol: GBPUSD
Direction: SHORT
Entry: 1.2700
Exit: 1.2750
Lot Size: 1.0
Confluence: 35%
→ P&L: -$50.00
```

---

## 🎓 Next Steps

1. **Add 5-10 trades** to see meaningful statistics
2. **Track confluence** for each trade
3. **Review metrics** after each week
4. **Identify patterns** in your winning vs losing trades
5. **Improve** your confluence scoring system

---

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints section
- Check browser console for errors
- Verify both servers are running

Happy Trading! 📈
