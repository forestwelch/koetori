-- Add status field to media_items for watchlist/backlog tracking
alter table media_items
    add column if not exists status text default 'to-watch' check (status in ('to-watch', 'watched', 'backlog'));

-- Create index for efficient status filtering
create index if not exists media_items_status_idx on media_items (status);

-- Initialize existing items as 'to-watch' (backfill)
update media_items
set status = 'to-watch'
where status is null;

COMMENT ON COLUMN media_items.status IS 'Watchlist status: to-watch (default), watched, or backlog';

