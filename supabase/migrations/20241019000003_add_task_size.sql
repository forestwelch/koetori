-- Add task size (t-shirt sizing) to memos table
ALTER TABLE memos ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('S', 'M', 'L'));
