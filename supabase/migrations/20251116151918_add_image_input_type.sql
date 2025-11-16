-- Add 'image' to the input_type check constraint
ALTER TABLE memos DROP CONSTRAINT IF EXISTS memos_input_type_check;

ALTER TABLE memos ADD CONSTRAINT memos_input_type_check 
  CHECK (input_type IN ('audio', 'text', 'image'));