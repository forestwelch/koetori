-- Add starred column to memos table
ALTER TABLE memos ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;

-- Create index for starred memos
CREATE INDEX IF NOT EXISTS idx_memos_starred ON memos(starred) WHERE starred = TRUE AND deleted_at IS NULL;

-- Update RLS policies to include starred
-- (Existing policies should already handle this column)
