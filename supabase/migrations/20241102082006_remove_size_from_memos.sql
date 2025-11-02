-- Remove size column from memos table
-- Size will be managed separately in the future todos system

ALTER TABLE memos DROP COLUMN IF EXISTS size;

COMMENT ON TABLE memos IS 'Size field removed. Size will be handled in the todos dashboard system.';

