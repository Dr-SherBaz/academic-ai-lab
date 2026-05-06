-- Blog engagement tables for anonymous comments, read count, likes/dislikes, shares

-- Blog comments with moderation
CREATE TABLE IF NOT EXISTS blog_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  ip_hash TEXT DEFAULT '',
  user_agent_hash TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  approved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_slug ON blog_comments(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);

-- Blog metrics: reads, likes, dislikes, shares per slug
CREATE TABLE IF NOT EXISTS blog_metrics (
  slug TEXT PRIMARY KEY,
  reads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);
