-- Add username field to memos table
ALTER TABLE memos ADD COLUMN username TEXT;

-- Create index for performance
CREATE INDEX idx_memos_username ON memos(username);

-- Update RLS policy to include username filtering
-- First drop existing policy
DROP POLICY IF EXISTS "Enable read access for all users" ON memos;

-- Create new policy that filters by username
CREATE POLICY "Enable read access for users" ON memos
    FOR SELECT USING (username = current_setting('app.current_username', true));

-- Update insert policy
DROP POLICY IF EXISTS "Enable insert for all users" ON memos;
CREATE POLICY "Enable insert for users" ON memos
    FOR INSERT WITH CHECK (username = current_setting('app.current_username', true));

-- Update update policy
DROP POLICY IF EXISTS "Enable update for all users" ON memos;
CREATE POLICY "Enable update for users" ON memos
    FOR UPDATE USING (username = current_setting('app.current_username', true));

-- Update delete policy
DROP POLICY IF EXISTS "Enable delete for all users" ON memos;
CREATE POLICY "Enable delete for users" ON memos
    FOR DELETE USING (username = current_setting('app.current_username', true));