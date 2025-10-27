-- Add transcript_excerpt column to memos table
-- This stores the relevant portion of the transcript for split memos
ALTER TABLE memos ADD COLUMN transcript_excerpt TEXT;

COMMENT ON COLUMN memos.transcript_excerpt IS 'Relevant portion of transcript (if split from multi-topic recording). Used for displaying excerpts in UI.';

