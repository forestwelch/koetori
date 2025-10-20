-- Create users table for simple authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  secret_word TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast username lookups
CREATE INDEX idx_users_username ON users(username);

-- Insert Forest's user record (assuming secret word will be set)
-- This will be updated when Forest logs in with a secret word
INSERT INTO users (username, secret_word) 
VALUES ('forest', 'temp_secret_change_me');