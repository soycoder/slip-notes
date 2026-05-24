-- SlipNotes: notes table with RLS
-- Run this in your Supabase SQL editor or via `supabase db push`

CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT '',
  content         TEXT NOT NULL DEFAULT '',
  color           TEXT NOT NULL DEFAULT 'default',
  is_pinned       BOOLEAN NOT NULL DEFAULT false,
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  tags            JSONB NOT NULL DEFAULT '[]',
  type            TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'slip')),
  slip_data       JSONB,
  slip_image_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes (user_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS notes_type_idx ON notes (user_id, type) WHERE NOT is_deleted;

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row-level security: users only access their own notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-purge trash older than 30 days (optional: run as a scheduled cron)
-- SELECT cron.schedule('purge-old-trash', '0 3 * * *', $$
--   DELETE FROM notes WHERE is_deleted = true AND deleted_at < now() - INTERVAL '30 days';
-- $$);
