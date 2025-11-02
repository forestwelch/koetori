-- Remove therapy category and migrate existing therapy memos to journal
-- Therapy insights are now part of the journal category

-- First, migrate all existing therapy memos to journal
UPDATE memos
SET category = 'journal'
WHERE category = 'therapy';

-- Drop the old constraint
ALTER TABLE memos DROP CONSTRAINT IF EXISTS memos_category_check;

-- Add new constraint without therapy
ALTER TABLE memos ADD CONSTRAINT memos_category_check 
  CHECK (category IN ('media', 'event', 'journal', 'tarot', 'todo', 'idea', 'to buy', 'other'));

-- Add comment
COMMENT ON CONSTRAINT memos_category_check ON memos IS 'Validates category values - therapy category has been merged into journal';

