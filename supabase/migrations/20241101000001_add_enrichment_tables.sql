-- Phase 3 enrichment persistence tables

-- Media enrichment storage
create table if not exists media_items (
    id uuid primary key default gen_random_uuid(),
    memo_id uuid not null references memos(id) on delete cascade unique,
    title text not null,
    release_year integer,
    runtime_minutes integer,
    poster_url text,
    overview text,
    trailer_url text,
    platforms jsonb,
    ratings jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists media_items_memo_id_idx on media_items (memo_id);

-- Reminder enrichment storage
create table if not exists reminders (
    id uuid primary key default gen_random_uuid(),
    memo_id uuid not null references memos(id) on delete cascade unique,
    title text not null,
    due_date_text text,
    recurrence_text text,
    priority_score numeric,
    status text not null default 'pending',
    scheduled_for timestamptz,
    acknowledged_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists reminders_status_idx on reminders (status);
create index if not exists reminders_memo_id_idx on reminders (memo_id);

-- Shopping enrichment storage
create table if not exists shopping_list_items (
    id uuid primary key default gen_random_uuid(),
    memo_id uuid not null references memos(id) on delete cascade unique,
    item_name text not null,
    quantity text,
    category text,
    urgency_score numeric,
    status text not null default 'open',
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists shopping_list_items_status_idx on shopping_list_items (status);
create index if not exists shopping_list_items_memo_id_idx on shopping_list_items (memo_id);

-- Track enrichment completion on memos
alter table memos
    add column if not exists enrichment_processed_at timestamptz;

create index if not exists memos_enrichment_processed_at_idx
    on memos (enrichment_processed_at);

