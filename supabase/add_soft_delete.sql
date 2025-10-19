-- Add soft delete support to memos table
-- Run this in your Supabase SQL Editor

-- Add deleted_at column
ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for deleted memos
CREATE INDEX IF NOT EXISTS idx_memos_deleted_at ON memos(deleted_at);

-- Update existing policies to exclude deleted memos by default
DROP POLICY IF EXISTS "Allow all operations for now" ON memos;

-- Policy for viewing active (non-deleted) memos
CREATE POLICY "View active memos" ON memos
  FOR SELECT
  USING (deleted_at IS NULL);

-- Policy for viewing deleted memos (trash)
CREATE POLICY "View deleted memos" ON memos
  FOR SELECT
  USING (deleted_at IS NOT NULL);

-- Policy for inserting new memos
CREATE POLICY "Insert memos" ON memos
  FOR INSERT
  WITH CHECK (true);

-- Policy for updating memos (including soft delete)
CREATE POLICY "Update memos" ON memos
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy for hard deleting memos
CREATE POLICY "Delete memos" ON memos
  FOR DELETE
  USING (true);

-- Optional: Create a function to auto-hard-delete memos older than 30 days
CREATE OR REPLACE FUNCTION delete_old_trashed_memos()
RETURNS void AS $$
BEGIN
  DELETE FROM memos 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job to run the cleanup function
-- You can set this up in Supabase Dashboard -> Database -> Cron Jobs
-- Or run it manually as needed
