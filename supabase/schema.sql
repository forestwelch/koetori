-- Supabase table schema for Phase 8: Smart Categorization
-- Run this in your Supabase SQL Editor

-- Create memos table
CREATE TABLE IF NOT EXISTS memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transcript TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('media', 'event', 'journal', 'therapy', 'tarot', 'todo', 'idea', 'other')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  needs_review BOOLEAN DEFAULT false,
  extracted JSONB,
  tags TEXT[],
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memos_needs_review ON memos(needs_review);
CREATE INDEX IF NOT EXISTS idx_memos_category ON memos(category);
CREATE INDEX IF NOT EXISTS idx_memos_timestamp ON memos(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- NOTE: In production, you should restrict this based on your auth setup
CREATE POLICY "Allow all operations for now" ON memos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON memos TO anon, authenticated;

-- Optional: Add a comment explaining the table
COMMENT ON TABLE memos IS 'Voice memos with AI-powered categorization and structured data extraction';
