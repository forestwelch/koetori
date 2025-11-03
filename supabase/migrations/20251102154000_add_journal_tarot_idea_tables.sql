-- Journal enrichment storage
-- Links memos with category="journal" to journal_items table
CREATE TABLE IF NOT EXISTS journal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE UNIQUE,
  entry_text TEXT NOT NULL,
  themes TEXT[], -- Array of themes/topics extracted from the entry
  mood TEXT, -- Optional mood indicator
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journal_items_memo_id_idx ON journal_items (memo_id);
CREATE INDEX IF NOT EXISTS journal_items_created_at_idx ON journal_items (created_at);

COMMENT ON TABLE journal_items IS 'Enrichment items for journal memos - links memos to the journal dashboard';
COMMENT ON COLUMN journal_items.memo_id IS 'References the memo that created this journal entry';
COMMENT ON COLUMN journal_items.entry_text IS 'The main journal entry text (from transcript or extracted.what)';
COMMENT ON COLUMN journal_items.themes IS 'Array of themes/topics extracted from the entry';
COMMENT ON COLUMN journal_items.mood IS 'Optional mood indicator (happy, sad, anxious, grateful, etc.)';

-- Tarot enrichment storage
-- Links memos with category="tarot" to tarot_items table
CREATE TABLE IF NOT EXISTS tarot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE UNIQUE,
  card_name TEXT NOT NULL, -- e.g., "Ten of Pentacles", "The Fool"
  card_type TEXT, -- major_arcana, minor_arcana
  suit TEXT, -- For minor arcana: wands, cups, swords, pentacles
  number TEXT, -- For minor arcana: ace, two, three, etc.
  interpretation TEXT, -- User's interpretation or notes about the card
  reading_context TEXT, -- Context of the reading (career, relationships, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tarot_items_memo_id_idx ON tarot_items (memo_id);
CREATE INDEX IF NOT EXISTS tarot_items_card_name_idx ON tarot_items (card_name);
CREATE INDEX IF NOT EXISTS tarot_items_created_at_idx ON tarot_items (created_at);

COMMENT ON TABLE tarot_items IS 'Enrichment items for tarot memos - links memos to the tarot dashboard';
COMMENT ON COLUMN tarot_items.memo_id IS 'References the memo that created this tarot reading';
COMMENT ON COLUMN tarot_items.card_name IS 'Name of the tarot card (e.g., "Ten of Pentacles", "The Fool")';
COMMENT ON COLUMN tarot_items.card_type IS 'Type of card: major_arcana or minor_arcana';
COMMENT ON COLUMN tarot_items.suit IS 'Suit for minor arcana cards: wands, cups, swords, pentacles';
COMMENT ON COLUMN tarot_items.number IS 'Number for minor arcana cards: ace, two, three, etc.';
COMMENT ON COLUMN tarot_items.interpretation IS 'User interpretation or notes about the card';
COMMENT ON COLUMN tarot_items.reading_context IS 'Context of the reading (career, relationships, personal growth, etc.)';

-- Idea enrichment storage
-- Links memos with category="idea" to idea_items table
CREATE TABLE IF NOT EXISTS idea_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL, -- Short title/summary of the idea
  description TEXT, -- More detailed description
  category TEXT, -- Optional category (product, feature, project, etc.)
  tags TEXT[], -- Array of tags for the idea
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'exploring', 'planning', 'on-hold', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idea_items_memo_id_idx ON idea_items (memo_id);
CREATE INDEX IF NOT EXISTS idea_items_status_idx ON idea_items (status);
CREATE INDEX IF NOT EXISTS idea_items_created_at_idx ON idea_items (created_at);

COMMENT ON TABLE idea_items IS 'Enrichment items for idea memos - links memos to the ideas dashboard';
COMMENT ON COLUMN idea_items.memo_id IS 'References the memo that created this idea';
COMMENT ON COLUMN idea_items.title IS 'Short title/summary of the idea';
COMMENT ON COLUMN idea_items.description IS 'More detailed description of the idea';
COMMENT ON COLUMN idea_items.category IS 'Optional category (product, feature, project, creative, etc.)';
COMMENT ON COLUMN idea_items.status IS 'Status of the idea: new, exploring, planning, on-hold, archived';

