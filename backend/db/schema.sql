-- Trading Dashboard Schema
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL DEFAULT 1, -- Associate trades with users
  trade_date TIMESTAMP DEFAULT NOW(),
  symbol VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'LONG' or 'SHORT'
  entry_price DECIMAL(12,5) NOT NULL,
  exit_price DECIMAL(12,5),
  lot_size DECIMAL(10,2) NOT NULL,
  pnl DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED'
  
  -- Confluence factors (0-100 for each)
  weekly_tf INT DEFAULT 0,
  daily_tf INT DEFAULT 0,
  h4_tf INT DEFAULT 0,
  h1_tf INT DEFAULT 0,
  lower_tf INT DEFAULT 0,
  total_confluence INT DEFAULT 0,
  
  -- Additional metrics
  risk_reward DECIMAL(5,2),
  stop_loss DECIMAL(12,5),
  take_profit DECIMAL(12,5),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE DEFAULT CURRENT_DATE,
  starting_balance DECIMAL(12,2) DEFAULT 100000,
  current_balance DECIMAL(12,2) DEFAULT 100000,
  daily_pnl DECIMAL(12,2) DEFAULT 0,
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
