-- Extend media_items with richer metadata
alter table media_items
    add column if not exists backdrop_url text,
    add column if not exists tmdb_id text,
    add column if not exists imdb_id text,
    add column if not exists media_type text,
    add column if not exists genres jsonb,
    add column if not exists providers jsonb;

create index if not exists media_items_tmdb_id_idx on media_items (tmdb_id);
create index if not exists media_items_media_type_idx on media_items (media_type);

-- Enrich reminders metadata
alter table reminders
    add column if not exists is_recurring boolean default false,
    add column if not exists due_at timestamptz,
    add column if not exists recurrence_rule text;

create index if not exists reminders_due_at_idx on reminders (due_at);
create index if not exists reminders_is_recurring_idx on reminders (is_recurring);

