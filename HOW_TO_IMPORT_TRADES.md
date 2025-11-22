# How to Import Trades from Your Broker

## Quick Start

### Step 1: Export from Your Broker

#### MetaTrader 4/5 (Most Common)
1. Open MT4 or MT5
2. Click on "Terminal" at the bottom (or press Ctrl+T)
3. Go to "Account History" tab
4. Right-click anywhere in the history
5. Select "Save as Report" → Choose "Open XML" or "CSV"
6. Save the file to your computer

#### cTrader
1. Open cTrader
2. Go to "History" tab
3. Click "Export" button
4. Choose CSV format
5. Save the file

#### TradingView
1. Go to your Trading Panel
2. Click on "Orders" or "Positions"
3. Click "Export" icon
4. Download CSV file

#### Other Brokers
Most brokers have an "Export" or "Download History" button in their platform or web interface. Look for:
- CSV export
- Excel export
- Trade history download

---

## Step 2: Import to Dashboard

### Using the Import Feature

1. **Open Dashboard**
   - Go to `http://localhost:5173`

2. **Click "Import CSV" Button**
   - Located at the top right, next to "+ New Trade"

3. **Upload Your CSV File**
   - Click "Choose CSV File"
   - Select the file you exported from your broker
   - Wait for parsing (usually instant)

4. **Map Columns**
   - The system will auto-detect most columns
   - Verify the mappings are correct:
     - **Trade Date** → Your date/time column
     - **Symbol** → Pair/instrument name
     - **Type** → Buy/Sell or Long/Short
     - **Entry Price** → Opening price
     - **Exit Price** → Closing price
     - **Lot Size** → Volume/size
     - **P&L** → Profit/Loss amount

5. **Preview Trades**
   - Review the trades before importing
   - Check that data looks correct
   - See how many trades will be imported

6. **Import**
   - Click "Import X Trades" button
   - Wait for completion
   - Done! Your trades are now in the dashboard

---

## Sample CSV Format

Your CSV should have these columns (names can vary):

```csv
Date,Symbol,Type,Entry Price,Exit Price,Lot Size,Profit
2025-11-01 10:30:00,EURUSD,Buy,1.0850,1.0900,1.0,500.00
2025-11-02 09:00:00,XAUUSD,Buy,2000.00,2050.00,0.1,500.00
2025-11-03 11:20:00,EURUSD,Sell,1.0820,1.0800,1.0,-200.00
```

**Minimum Required Columns:**
- Date/Time
- Symbol
- Type (Buy/Sell)
- Entry Price
- Lot Size

**Optional Columns:**
- Exit Price (can be added later)
- P&L (will be calculated if missing)
- Stop Loss
- Take Profit

---

## Common Issues & Solutions

### Issue 1: "File is empty"
**Solution:** Make sure your CSV has data rows, not just headers.

### Issue 2: Columns not detected
**Solution:** Manually select the correct columns in Step 2.

### Issue 3: Wrong direction (Long/Short)
**Solution:** Check your Type column. It should contain "Buy", "Long", "Sell", or "Short".

### Issue 4: Dates not parsing
**Solution:** Dates should be in format: `YYYY-MM-DD HH:MM:SS` or `MM/DD/YYYY HH:MM:SS`

### Issue 5: Duplicate trades
**Solution:** Currently, the system will import all trades. Delete duplicates manually or clear all trades before re-importing.

---

## Tips for Best Results

### 1. Clean Your Data
- Remove any summary rows
- Remove empty rows
- Keep only actual trade data

### 2. Check Date Format
- Most common: `2025-11-01 10:30:00`
- Also works: `11/01/2025 10:30 AM`

### 3. Symbol Names
- Use standard format: `EURUSD`, `XAUUSD`, `GBPUSD`
- Remove any extra characters

### 4. Lot Sizes
- Use decimal format: `1.0`, `0.5`, `0.01`
- Not: `1 lot`, `0.5 lots`

### 5. P&L Values
- Use numbers only: `500.00`, `-200.00`
- Not: `$500`, `+500`, `500 USD`

---

## Broker-Specific Guides

### MetaTrader 4/5 Detailed Steps

**Export Method 1: Account History**
```
1. Terminal → Account History tab
2. Right-click → "All History"
3. Right-click again → "Save as Report"
4. Choose "Open XML" format
5. Save as "trades.csv"
```

**Export Method 2: Statement**
```
1. Terminal → Account History tab
2. Right-click → "Save as Detailed Report"
3. Choose HTML or XML
4. Open in Excel
5. Save as CSV
```

**Column Names in MT4/MT5:**
- `Open Time` → Date
- `Symbol` → Symbol
- `Type` → Type (Buy/Sell)
- `Volume` → Lot Size
- `Price` → Entry Price
- `S/L` → Stop Loss
- `T/P` → Take Profit
- `Close Time` → Exit Date
- `Close Price` → Exit Price
- `Profit` → P&L

### cTrader

**Column Names:**
- `Created` → Date
- `Symbol` → Symbol
- `Side` → Type (Buy/Sell)
- `Quantity` → Lot Size
- `Entry Price` → Entry Price
- `Closing Price` → Exit Price
- `Gross Profit` → P&L

### OANDA

**Column Names:**
- `Time` → Date
- `Instrument` → Symbol
- `Side` → Type
- `Units` → Lot Size
- `Price` → Entry Price
- `Close Price` → Exit Price
- `P/L` → P&L

---

## After Importing

### What Happens Next?

1. **Trades Appear in Dashboard**
   - Go to "All Trades" tab to see them
   - They'll show as "CLOSED" status

2. **Metrics Update Automatically**
   - Profit Factor
   - Win Rate
   - Average Win/Loss
   - All other metrics

3. **Calendar Updates**
   - Go to "Monthly Calendar" tab
   - See your daily P&L visualized

4. **Confluence Scores**
   - Imported trades have 0% confluence
   - You can edit trades to add confluence scores later

### Next Steps

1. **Review Imported Trades**
   - Check for any errors
   - Delete duplicates if any

2. **Add Confluence Scores** (Optional)
   - Click "Edit" on any trade
   - Add your confluence analysis
   - This helps track trade quality

3. **Analyze Performance**
   - Check your metrics
   - Review monthly calendar
   - Identify patterns

---

## Advanced: Automatic Import

### Option 1: MT4/MT5 Expert Advisor (Coming Soon)
- Automatically sync trades
- Real-time updates
- No manual export needed

### Option 2: Broker API Integration (Coming Soon)
- Direct connection to broker
- Live trade tracking
- Automatic balance updates

### Option 3: Scheduled Import Script
- Run a script daily
- Auto-export from MT4/MT5
- Auto-import to dashboard

---

## Sample File

A sample CSV file (`sample_trades.csv`) is included in the project root. Use it to test the import feature:

```bash
# The file contains 10 sample trades with:
- Different symbols (EURUSD, GBPUSD, XAUUSD, USDJPY)
- Mix of wins and losses
- Various lot sizes
- Realistic P&L values
```

---

## Need Help?

### Common Questions

**Q: Can I import trades multiple times?**
A: Yes, but it will create duplicates. Delete old trades first if re-importing.

**Q: What if my broker's CSV format is different?**
A: The column mapping feature handles most formats. Just map your columns correctly in Step 2.

**Q: Can I import open trades?**
A: Yes, just leave the Exit Price empty. You can close them later in the dashboard.

**Q: How many trades can I import at once?**
A: No limit, but large files (1000+ trades) may take a minute to import.

**Q: Will this work with stocks/crypto?**
A: Yes! Works with any instrument. Just make sure your CSV has the required columns.

---

## Troubleshooting

### Import Button Not Working
1. Check browser console (F12) for errors
2. Make sure backend is running on port 4000
3. Try refreshing the page

### Trades Not Showing After Import
1. Go to "All Trades" tab
2. Check filter (should be "ALL" not "OPEN")
3. Refresh the page

### Wrong P&L Calculations
1. Check that Entry and Exit prices are correct
2. Verify Lot Size is a number
3. Make sure Direction (Long/Short) is correct

---

## Video Tutorial (Coming Soon)

We'll create video tutorials for:
- [ ] MT4/MT5 export and import
- [ ] cTrader export and import
- [ ] TradingView export and import
- [ ] Troubleshooting common issues

---

Happy Trading! 📊✨
