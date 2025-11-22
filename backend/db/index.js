// Simple in-memory database for demo (replace with PostgreSQL in production)
class Database {
  constructor() {
    this.trades = [];
    this.accountStats = {
      startingBalance: 100000,
      currentBalance: 100000,
      dailyPnl: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0
    };
    this.tradeIdCounter = 1;
  }

  // Trades
  async getAllTrades() {
    return this.trades.sort((a, b) => new Date(b.trade_date) - new Date(a.trade_date));
  }

  async getTradeById(id) {
    return this.trades.find(t => t.id === parseInt(id));
  }

  async createTrade(trade) {
    const newTrade = {
      id: this.tradeIdCounter++,
      trade_date: new Date().toISOString(),
      status: trade.status || 'OPEN',
      pnl: trade.pnl || 0,
      total_confluence: this.calculateTotalConfluence(trade),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...trade
    };
    
    // If PnL is provided but no exit price, calculate exit price
    if (trade.pnl && !trade.exit_price && trade.entry_price) {
      const pnlPerLot = trade.pnl / trade.lot_size;
      newTrade.exit_price = trade.direction === 'LONG'
        ? parseFloat(trade.entry_price) + pnlPerLot
        : parseFloat(trade.entry_price) - pnlPerLot;
    }
    
    // If exit price is provided but no PnL, calculate PnL
    if (trade.exit_price && !trade.pnl) {
      newTrade.pnl = this.calculatePnL(newTrade);
    }
    
    this.trades.push(newTrade);
    this.updateAccountStats();
    return newTrade;
  }

  async updateTrade(id, updates) {
    const index = this.trades.findIndex(t => t.id === parseInt(id));
    if (index === -1) return null;
    
    this.trades[index] = {
      ...this.trades[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    if (updates.exit_price) {
      this.trades[index].pnl = this.calculatePnL(this.trades[index]);
      this.trades[index].status = 'CLOSED';
    }
    
    if (updates.weekly_tf !== undefined || updates.daily_tf !== undefined || 
        updates.h4_tf !== undefined || updates.h1_tf !== undefined || 
        updates.lower_tf !== undefined) {
      this.trades[index].total_confluence = this.calculateTotalConfluence(this.trades[index]);
    }
    
    this.updateAccountStats();
    return this.trades[index];
  }

  async deleteTrade(id) {
    const index = this.trades.findIndex(t => t.id === parseInt(id));
    if (index === -1) return false;
    this.trades.splice(index, 1);
    this.updateAccountStats();
    return true;
  }

  calculateTotalConfluence(trade) {
    const weekly = parseInt(trade.weekly_tf) || 0;
    const daily = parseInt(trade.daily_tf) || 0;
    const h4 = parseInt(trade.h4_tf) || 0;
    const h1 = parseInt(trade.h1_tf) || 0;
    const lower = parseInt(trade.lower_tf) || 0;
    return Math.round((weekly + daily + h4 + h1 + lower) / 5);
  }

  calculatePnL(trade) {
    if (!trade.exit_price || !trade.entry_price) return 0;
    
    const priceDiff = trade.direction === 'LONG' 
      ? trade.exit_price - trade.entry_price
      : trade.entry_price - trade.exit_price;
    
    return parseFloat((priceDiff * trade.lot_size).toFixed(2));
  }

  updateAccountStats() {
    const closedTrades = this.trades.filter(t => t.status === 'CLOSED');
    const totalPnl = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
    
    this.accountStats = {
      startingBalance: 100000,
      currentBalance: 100000 + totalPnl,
      totalTrades: closedTrades.length,
      winningTrades: closedTrades.filter(t => t.pnl > 0).length,
      losingTrades: closedTrades.filter(t => t.pnl < 0).length,
      totalPnl: totalPnl
    };
  }

  async getAccountStats() {
    return this.accountStats;
  }

  async getMetrics() {
    const closedTrades = this.trades.filter(t => t.status === 'CLOSED');
    
    if (closedTrades.length === 0) {
      return {
        profitFactor: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        avgConfluence: 0,
        totalTrades: 0,
        openTrades: this.trades.filter(t => t.status === 'OPEN').length
      };
    }

    const wins = closedTrades.filter(t => t.pnl > 0);
    const losses = closedTrades.filter(t => t.pnl < 0);
    
    const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    
    const avgConfluence = closedTrades.reduce((sum, t) => sum + (t.total_confluence || 0), 0) / closedTrades.length;

    return {
      profitFactor: totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : totalWins > 0 ? 999 : 0,
      winRate: ((wins.length / closedTrades.length) * 100).toFixed(1),
      avgWin: wins.length > 0 ? (totalWins / wins.length).toFixed(2) : 0,
      avgLoss: losses.length > 0 ? (totalLosses / losses.length).toFixed(2) : 0,
      largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl)).toFixed(2) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl)).toFixed(2) : 0,
      avgConfluence: avgConfluence.toFixed(1),
      totalTrades: closedTrades.length,
      openTrades: this.trades.filter(t => t.status === 'OPEN').length
    };
  }

  async getDailyPnL() {
    const dailyData = {};
    
    this.trades.filter(t => t.status === 'CLOSED').forEach(trade => {
      const date = new Date(trade.trade_date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += parseFloat(trade.pnl) || 0;
    });

    return Object.entries(dailyData)
      .map(([date, pnl]) => ({ date, pnl: parseFloat(pnl.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

module.exports = new Database();
