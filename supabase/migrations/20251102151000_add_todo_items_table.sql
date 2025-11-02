-- Todo enrichment storage
-- Links memos with category="todo" to todo_items table
-- This allows todos to be displayed in the todos dashboard and tracked separately

CREATE TABLE IF NOT EXISTS todo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  size TEXT CHECK (size IN ('S', 'M', 'L')) DEFAULT 'M',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'archived')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS todo_items_memo_id_idx ON todo_items (memo_id);
CREATE INDEX IF NOT EXISTS todo_items_status_idx ON todo_items (status);

COMMENT ON TABLE todo_items IS 'Enrichment items for todo memos - links memos to the todos dashboard';
COMMENT ON COLUMN todo_items.memo_id IS 'References the memo that created this todo';
COMMENT ON COLUMN todo_items.summary IS 'Brief summary of the todo task (from extracted.what or transcript)';
COMMENT ON COLUMN todo_items.size IS 'Estimated size: S (<5min), M (<30min), L (>30min)';
COMMENT ON COLUMN todo_items.status IS 'Current status of the todo';

