-- Unified table for collecting user feedback on memo edits
-- This will be used by the AI learning system to improve categorization and extraction

CREATE TABLE IF NOT EXISTS memo_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID REFERENCES memos(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  
  -- Edit type: category, summary, size, transcript, tags, etc.
  edit_type TEXT NOT NULL,
  
  -- Original and new values
  original_value TEXT,
  new_value TEXT,
  
  -- User's explanation for the change
  feedback_text TEXT,
  
  -- Metadata
  transcript TEXT, -- Store transcript for context
  category TEXT, -- Store category at time of edit
  confidence NUMERIC, -- Store confidence score if available
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying feedback patterns
CREATE INDEX idx_memo_feedback_edit_type ON memo_feedback(edit_type);
CREATE INDEX idx_memo_feedback_username ON memo_feedback(username);
CREATE INDEX idx_memo_feedback_created ON memo_feedback(created_at DESC);
CREATE INDEX idx_memo_feedback_memo_id ON memo_feedback(memo_id);

COMMENT ON TABLE memo_feedback IS 'Tracks user corrections and explanations for memo edits to improve AI learning system';
COMMENT ON COLUMN memo_feedback.edit_type IS 'Type of edit: category, summary, size, transcript, tags, etc.';
COMMENT ON COLUMN memo_feedback.feedback_text IS 'Optional user explanation for why they made this change';

