-- Create feedback table for bug reports and user feedback
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array of image URLs/paths
  user_agent TEXT,
  url TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert feedback (no auth required for bug reports)
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);

-- Create policy to allow reading feedback (for admin/developer access)
CREATE POLICY "Allow read access to feedback" ON feedback FOR SELECT USING (true);

-- Add index for created_at for sorting
CREATE INDEX idx_feedback_created_at ON feedback (created_at DESC);