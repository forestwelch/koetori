CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  llm_tokens_used INTEGER NOT NULL DEFAULT 0,
  audio_seconds_used REAL NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, date)
);

CREATE INDEX idx_daily_usage_username_date ON daily_usage(username, date);

COMMENT ON TABLE daily_usage IS 'Track daily LLM token and audio usage per user for Groq API quota management';
COMMENT ON COLUMN daily_usage.llm_tokens_used IS 'Total LLM tokens consumed today (llama models)';
COMMENT ON COLUMN daily_usage.audio_seconds_used IS 'Total audio seconds transcribed today (whisper)';
COMMENT ON COLUMN daily_usage.requests_count IS 'Total API requests made today';

