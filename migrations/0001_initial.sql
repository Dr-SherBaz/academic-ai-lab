-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  service_category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  academic_level TEXT DEFAULT '',
  discipline TEXT DEFAULT '',
  deadline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  preferred_channel TEXT DEFAULT 'WhatsApp',
  status TEXT DEFAULT 'pending_review',
  payment_status TEXT DEFAULT 'unpaid',
  delivery_status TEXT DEFAULT 'not_ready',
  assigned_expert TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  quote_amount TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS magic_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Expert network applications
CREATE TABLE IF NOT EXISTS experts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  expertise TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  status TEXT DEFAULT 'pending_review',
  admin_notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  client_name TEXT DEFAULT '',
  rating INTEGER DEFAULT 0,
  feedback TEXT NOT NULL,
  display_status TEXT DEFAULT 'pending_approval',
  created_at TEXT DEFAULT (datetime('now'))
);

-- File uploads tracking
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  storage_path TEXT NOT NULL,
  uploaded_at TEXT DEFAULT (datetime('now'))
);

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  previous_status TEXT DEFAULT '',
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'system',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- WhatsApp incoming messages log
CREATE TABLE IF NOT EXISTS incoming_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wa_from TEXT NOT NULL,
  wa_message_id TEXT,
  wa_text TEXT DEFAULT '',
  raw_json TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- WhatsApp message delivery status
CREATE TABLE IF NOT EXISTS message_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wa_message_id TEXT,
  status TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Price templates for estimates
CREATE TABLE IF NOT EXISTS price_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  pricing_model TEXT NOT NULL,
  suggested_price TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_order_id ON magic_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_token_hash ON magic_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_uploads_order_id ON uploads(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_incoming_messages_from ON incoming_messages(wa_from);
