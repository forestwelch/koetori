-- Add source and device tracking to memos table
-- Tracks where memos come from (app vs device) and how they were captured (audio vs text)

-- Add source column (where the memo came from)
ALTER TABLE memos ADD COLUMN source TEXT DEFAULT 'app' NOT NULL;

-- Add input_type column (how the memo was captured)
ALTER TABLE memos ADD COLUMN input_type TEXT DEFAULT 'audio' NOT NULL;

-- Add device_id column (optional, only for device-sourced memos)
ALTER TABLE memos ADD COLUMN device_id TEXT;

-- Add constraints to ensure valid values
ALTER TABLE memos ADD CONSTRAINT memos_source_check 
  CHECK (source IN ('app', 'device'));

ALTER TABLE memos ADD CONSTRAINT memos_input_type_check 
  CHECK (input_type IN ('audio', 'text'));

-- Create indexes for filtering by source and input type
CREATE INDEX idx_memos_source ON memos(source);
CREATE INDEX idx_memos_input_type ON memos(input_type);
CREATE INDEX idx_memos_device_id ON memos(device_id) WHERE device_id IS NOT NULL;

-- Backfill existing memos (they're all from the app via audio)
UPDATE memos 
SET source = 'app', input_type = 'audio' 
WHERE source IS NULL OR input_type IS NULL;

