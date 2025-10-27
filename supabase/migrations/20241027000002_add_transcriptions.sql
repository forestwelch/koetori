-- Create transcriptions table to store full audio transcripts
-- Multiple memos can reference the same transcription
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript TEXT NOT NULL,
  username TEXT NOT NULL,
  audio_duration_seconds REAL,
  source TEXT DEFAULT 'device',
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transcriptions_username ON transcriptions(username);
CREATE INDEX idx_transcriptions_created_at ON transcriptions(created_at);

COMMENT ON TABLE transcriptions IS 'Full audio transcriptions that can be split into multiple memos';
COMMENT ON COLUMN transcriptions.transcript IS 'Complete transcript from Whisper';
COMMENT ON COLUMN transcriptions.audio_duration_seconds IS 'Length of the original audio recording';

-- Add transcription_id to memos table
ALTER TABLE memos ADD COLUMN transcription_id UUID REFERENCES transcriptions(id) ON DELETE SET NULL;

CREATE INDEX idx_memos_transcription_id ON memos(transcription_id);

COMMENT ON COLUMN memos.transcription_id IS 'Links memo to its source transcription (if split from multi-topic recording)';

