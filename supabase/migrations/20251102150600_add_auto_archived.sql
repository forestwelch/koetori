-- Add auto_archived column to track memos that were automatically archived
-- This allows users to see which memos were auto-archived and restore them if needed

ALTER TABLE memos
ADD COLUMN IF NOT EXISTS auto_archived BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for filtering auto-archived memos
CREATE INDEX IF NOT EXISTS idx_memos_auto_archived ON memos(auto_archived) WHERE auto_archived = TRUE;

COMMENT ON COLUMN memos.auto_archived IS 'True if this memo was automatically archived by garbage detection. Users can restore these memos if they were incorrectly archived.';

