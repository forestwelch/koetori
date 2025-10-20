-- Add table for tracking category corrections to improve AI
-- This is optional but useful for future model fine-tuning

CREATE TABLE IF NOT EXISTS category_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID REFERENCES memos(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  original_category TEXT NOT NULL,
  corrected_category TEXT NOT NULL,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying feedback patterns
CREATE INDEX idx_category_feedback_categories ON category_feedback(original_category, corrected_category);
CREATE INDEX idx_category_feedback_created ON category_feedback(created_at DESC);

-- Optional: Add a trigger to automatically log category changes
-- (Uncomment if you want automatic tracking without manual logging)
-- CREATE OR REPLACE FUNCTION log_category_change()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.category IS DISTINCT FROM OLD.category THEN
--     INSERT INTO category_feedback (memo_id, transcript, original_category, corrected_category, confidence)
--     VALUES (NEW.id, NEW.transcript, OLD.category, NEW.category, OLD.confidence);
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- CREATE TRIGGER category_change_trigger
-- AFTER UPDATE ON memos
-- FOR EACH ROW
-- WHEN (NEW.category IS DISTINCT FROM OLD.category)
-- EXECUTE FUNCTION log_category_change();

COMMENT ON TABLE category_feedback IS 'Tracks user corrections to AI category predictions for model improvement';
