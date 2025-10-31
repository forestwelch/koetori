-- Add override metadata for media items
alter table media_items
    add column if not exists auto_title text,
    add column if not exists custom_title text,
    add column if not exists auto_release_year integer,
    add column if not exists custom_release_year integer,
    add column if not exists search_debug jsonb;

-- Track extracted item lists for shopping entries
alter table shopping_list_items
    add column if not exists items jsonb;

