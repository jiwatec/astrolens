-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Supabase SQL Setup — APOD History Table                       ║
-- ║  Run in:  Supabase Dashboard → SQL Editor → New Query          ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Store each day's APOD (auto-saved by the server)
CREATE TABLE IF NOT EXISTS apod_history (
  id            BIGSERIAL    PRIMARY KEY,
  date          TEXT         NOT NULL UNIQUE,
  title         TEXT         NOT NULL,
  description   TEXT         NOT NULL,
  image_url     TEXT         NOT NULL,
  hd_url        TEXT         DEFAULT '',
  media_type    TEXT         DEFAULT 'image',
  copyright     TEXT         DEFAULT '',
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apod_date ON apod_history (date DESC);

-- Enable RLS and allow public reads
ALTER TABLE apod_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON apod_history;
CREATE POLICY "Allow public read access"
  ON apod_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert" ON apod_history;
CREATE POLICY "Allow insert"
  ON apod_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update" ON apod_history;
CREATE POLICY "Allow update"
  ON apod_history FOR UPDATE USING (true);

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Anonymous Community Comments Table                            ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS comments (
  id            BIGSERIAL    PRIMARY KEY,
  alias         TEXT         NOT NULL DEFAULT 'Stargazer',
  avatar_color  TEXT         NOT NULL DEFAULT '#9E6DFF',
  message       TEXT         NOT NULL,
  topic         TEXT         DEFAULT 'general',
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read comments" ON comments;
CREATE POLICY "Allow public read comments"
  ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert comments" ON comments;
CREATE POLICY "Allow public insert comments"
  ON comments FOR INSERT WITH CHECK (true);
