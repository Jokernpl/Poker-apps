-- =====================================================
-- POKER APP - DATABASE MIGRATIONS
-- =====================================================
-- Tutte le tabelle necessarie per l'app

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- =====================================================
-- USER STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_hands_played INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  total_chips_won DECIMAL(12, 2) DEFAULT 0,
  total_chips_lost DECIMAL(12, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  average_buy_in DECIMAL(10, 2) DEFAULT 0,
  biggest_win DECIMAL(10, 2) DEFAULT 0,
  biggest_loss DECIMAL(10, 2) DEFAULT 0,
  longest_winning_streak INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- USER WALLET (Chip/Crediti)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 1000,
  total_deposited DECIMAL(12, 2) DEFAULT 0,
  total_withdrawn DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLES (Tavoli di gioco)
-- =====================================================
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  table_type VARCHAR(20) NOT NULL, -- 'CASH' or 'TOURNAMENT'
  status VARCHAR(20) DEFAULT 'WAITING', -- 'WAITING', 'PLAYING', 'CLOSED'
  small_blind DECIMAL(10, 2) NOT NULL,
  big_blind DECIMAL(10, 2) NOT NULL,
  min_buy_in DECIMAL(10, 2) NOT NULL,
  max_buy_in DECIMAL(10, 2) NOT NULL,
  max_players INT DEFAULT 9,
  current_players INT DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE SEATS (Posti al tavolo)
-- =====================================================
CREATE TABLE IF NOT EXISTS table_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL,
  user_id UUID,
  seat_number INT NOT NULL,
  chip_stack DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(table_id, seat_number)
);

-- =====================================================
-- HANDS (Mani giocate)
-- =====================================================
CREATE TABLE IF NOT EXISTS hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL,
  hand_number INT NOT NULL,
  dealer_seat INT NOT NULL,
  small_blind_seat INT NOT NULL,
  big_blind_seat INT NOT NULL,
  community_cards VARCHAR(15), -- es. "As Kh Qd"
  pot DECIMAL(12, 2) DEFAULT 0,
  winner_id UUID,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- HAND ACTIONS (Azioni durante la mano)
-- =====================================================
CREATE TABLE IF NOT EXISTS hand_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hand_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action_type VARCHAR(20) NOT NULL, -- 'FOLD', 'CHECK', 'CALL', 'RAISE', 'ALL_IN'
  amount DECIMAL(10, 2),
  position VARCHAR(10), -- 'SMALL_BLIND', 'BIG_BLIND', 'EARLY', 'MIDDLE', 'LATE'
  street VARCHAR(10), -- 'PREFLOP', 'FLOP', 'TURN', 'RIVER'
  hole_cards VARCHAR(5), -- es. "AsKh"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hand_id) REFERENCES hands(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TRANSACTIONS (Transazioni chip/denaro)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(30) NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'BUY_IN', 'CASH_OUT', 'BONUS'
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED'
  description TEXT,
  related_hand_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_hand_id) REFERENCES hands(id) ON DELETE SET NULL
);

-- =====================================================
-- CHAT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- BAN LIST (Giocatori bannati)
-- =====================================================
CREATE TABLE IF NOT EXISTS bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_by UUID,
  reason TEXT NOT NULL,
  duration_hours INT, -- NULL = permanente
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- ADMIN LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_user_id UUID,
  target_table_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (target_table_id) REFERENCES tables(id) ON DELETE SET NULL
);

-- =====================================================
-- INDICES (Ottimizzazione query)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallet_user_id ON user_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_table_seats_table_id ON table_seats(table_id);
CREATE INDEX IF NOT EXISTS idx_table_seats_user_id ON table_seats(user_id);
CREATE INDEX IF NOT EXISTS idx_hands_table_id ON hands(table_id);
CREATE INDEX IF NOT EXISTS idx_hands_winner_id ON hands(winner_id);
CREATE INDEX IF NOT EXISTS idx_hand_actions_hand_id ON hand_actions(hand_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_table_id ON chat_messages(table_id);
CREATE INDEX IF NOT EXISTS idx_bans_user_id ON bans(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
