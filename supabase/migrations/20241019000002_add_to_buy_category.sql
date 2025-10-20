-- Add "to buy" category to the check constraint

-- First, drop the old constraint
ALTER TABLE memos DROP CONSTRAINT IF EXISTS memos_category_check;

-- Add new constraint with "to buy" included
ALTER TABLE memos ADD CONSTRAINT memos_category_check 
  CHECK (category IN ('media', 'event', 'journal', 'therapy', 'tarot', 'todo', 'idea', 'to buy', 'other'));

-- Add comment
COMMENT ON CONSTRAINT memos_category_check ON memos IS 'Validates category values including the to buy category';
