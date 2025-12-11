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

-- Learning Content Tables
CREATE TABLE IF NOT EXISTS learning_courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(50),
  lessons INT DEFAULT 0,
  level VARCHAR(50),
  price VARCHAR(50),
  thumbnail VARCHAR(10),
  topics TEXT[], -- Array of topics
  status VARCHAR(20) DEFAULT 'Draft',
  students INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(20),
  views INT DEFAULT 0,
  category VARCHAR(100),
  thumbnail VARCHAR(10),
  video_url TEXT,
  status VARCHAR(20) DEFAULT 'Draft',
  likes INT DEFAULT 0,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_streams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP,
  duration VARCHAR(50),
  registrations INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  format VARCHAR(50),
  size VARCHAR(20),
  icon VARCHAR(10),
  status VARCHAR(20) DEFAULT 'Draft',
  downloads INT DEFAULT 0,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
