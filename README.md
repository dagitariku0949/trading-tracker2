# 🚀 LEAP Trading Dashboard

> **Trade with Discipline** - A professional trading journal with advanced analytics, position calculator, and smart reminders.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org)

A comprehensive trading dashboard for serious traders who want to track performance, maintain discipline, and improve their trading edge through data-driven insights.

## Features

### 📊 Real-Time Metrics
- **Profit Factor** - Ratio of gross profit to gross loss
- **Win Rate** - Percentage of winning trades
- **Average Win/Loss** - Mean profit and loss per trade
- **Largest Win/Loss** - Best and worst single trades
- **Average Confluence** - Mean confluence score across all trades

### 🎯 Confluence Tracking
- Track confluence across 5 timeframes:
  - Weekly
  - Daily
  - 4H
  - 1H
  - Lower Timeframes
- Real-time overall confluence score
- Color-coded indicators (High/Medium/Low)

### 💰 Account Management
- Starting balance tracking ($100,000 default)
- Current balance with P&L percentage
- Total trades with win/loss breakdown
- Daily P&L visualization

### 📈 Trade Management
- Add new trades with full details
- Edit existing trades
- Close open positions with automatic P&L calculation
- Delete trades
- Filter by status (All/Open/Closed)

### 📅 Performance Visualization
- Daily P&L bar chart
- Color-coded profit/loss bars
- Historical performance tracking

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Running

**Backend** (Terminal 1):
```bash
cd backend
npm install
npm start
```
Backend runs on: `http://localhost:4000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

Open your browser to `http://localhost:5173`

## Usage Guide

### Adding a Trade
1. Click **"+ New Trade"** button
2. Fill in trade details:
   - **Symbol**: EURUSD, XAUUSD, GBPUSD, etc.
   - **Direction**: LONG or SHORT
   - **Entry Price**: Your entry price
   - **Lot Size**: Position size
   - **Confluence Scores**: Rate each timeframe 0-100%
     - Weekly TF
     - Daily TF
     - 4H TF
     - 1H TF
     - Lower TF
   - **Optional**: Exit price, Risk:Reward ratio, Notes
3. Click **"Create Trade"**

### Closing a Trade
1. Find your open trade in the list
2. Click **"Close"** button
3. Enter the exit price
4. P&L is automatically calculated based on:
   - Direction (LONG/SHORT)
   - Entry vs Exit price
   - Lot size

### Understanding Confluence Scores

The confluence system helps you evaluate trade quality:

- **0-100% per timeframe**: Rate how strong the setup is on each timeframe
- **Total Confluence**: Average of all 5 timeframes
- **Color Coding**:
  - 🟢 **High (70%+)**: Strong multi-timeframe alignment
  - 🟡 **Medium (40-69%)**: Moderate setup
  - 🔴 **Low (<40%)**: Weak confluence

**Example**: If you have:
- Weekly: 80%
- Daily: 70%
- 4H: 60%
- 1H: 50%
- Lower: 40%
- **Total: 60%** (Medium Confluence)

## API Endpoints

### Trades
- `GET /api/trades` - Get all trades
- `GET /api/trades/:id` - Get single trade
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

### Statistics
- `GET /api/trades/stats/account` - Account summary
- `GET /api/trades/stats/metrics` - Performance metrics
- `GET /api/trades/stats/daily` - Daily P&L data

## Tech Stack

**Backend**:
- Node.js + Express
- In-memory database (easily replaceable with PostgreSQL)
- RESTful API with CORS

**Frontend**:
- React 18
- Vite (fast dev server)
- Tailwind CSS
- Recharts (charts)
- Axios (API calls)

## Database

Currently uses in-memory storage. To use PostgreSQL:

1. Install PostgreSQL
2. Create database: `createdb trading_dashboard`
3. Run schema: `psql trading_dashboard < backend/db/schema.sql`
4. Update `backend/db/index.js` to use pg library
5. Add `DATABASE_URL` to `.env`

## Project Structure

```
trading-dashboard/
├── backend/
│   ├── db/
│   │   ├── index.js          # Database layer
│   │   └── schema.sql        # SQL schema
│   ├── routes/
│   │   ├── trades.js         # Trade endpoints
│   │   └── kiro.js           # Kiro AI integration
│   ├── lib/
│   │   └── kiroClient.js     # Kiro API client
│   ├── server.js             # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccountSummary.jsx
│   │   │   ├── ConfluenceCard.jsx
│   │   │   ├── MetricsGrid.jsx
│   │   │   ├── CalendarHeatmap.jsx
│   │   │   ├── TradesList.jsx
│   │   │   └── TradeForm.jsx
│   │   ├── api/
│   │   │   └── client.js     # Axios instance
│   │   ├── App.jsx           # Main app
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## ✨ New Features

### 🎨 Immersive Landing Page
- Beautiful gradient design with "Trade with Discipline" hero
- Interactive feature cards that navigate to specific sections
- Smooth animations and modern UI

### 🧮 Advanced Position Calculator
- Risk-based position sizing
- Support for multiple currency pairs (Forex, Gold, Silver, Crypto)
- Stop loss input via price or pips
- Automatic take profit level calculations (1:1, 1:2, 1:3 R:R)
- Real-time pip value and risk calculations

### 📊 After Trade Quick Entry
- Fast trade recording with win/loss tracking
- Integrated with "Close Trade" button
- Pre-filled trade information for quick journaling

### 📱 Smart Notification Reminders
- Browser notifications after 1 hour of opening a trade
- Reminds you to journal your trades
- Automatic cancellation when trade is closed
- Persistent reminders across page refreshes

### 📈 Advanced Analytics
- Equity curve visualization
- Monthly calendar view
- Trade journal with detailed notes
- Confluence analysis across multiple timeframes

### 🔄 MT4/MT5 Integration
- Expert Advisors for automatic trade sync
- Real-time trade tracking from MetaTrader
- Installation guides included

### 📥 CSV Import
- Import trades from broker statements
- Support for multiple broker formats (Exness, etc.)
- Bulk trade upload

## 📸 Screenshots

*(Add screenshots of your dashboard here)*

## 🎯 Perfect For

- Day traders and swing traders
- Forex, stocks, and crypto traders
- Traders working towards prop firm challenges
- Anyone serious about improving their trading discipline

## 🛠️ Tech Stack

**Frontend**:
- React 18 with Hooks
- Vite (lightning-fast dev server)
- Tailwind CSS (modern styling)
- Recharts (beautiful charts)
- Browser Notification API

**Backend**:
- Node.js + Express
- RESTful API architecture
- In-memory database (easily upgradeable to PostgreSQL)
- CORS enabled

**Trading Integration**:
- MT4/MT5 Expert Advisors (MQL4/MQL5)
- CSV import functionality
- Real-time sync capabilities

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Features Overview](FEATURES.md)
- [MT4/MT5 Integration](MT4_EA/INSTALLATION_GUIDE.md)
- [CSV Import Guide](HOW_TO_IMPORT_TRADES.md)
- [Notification Setup](NOTIFICATION_REMINDERS.md)
- [GitHub Setup](GITHUB_SETUP_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with passion for traders who value discipline
- Inspired by professional prop firm dashboards
- Community feedback and suggestions welcome

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

**⭐ If you find this project helpful, please consider giving it a star!**
