-- Migrate all existing memos to username 'forest'
UPDATE memos 
SET username = 'forest' 
WHERE username IS NULL;