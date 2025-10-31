-- Media item metadata enrichment
alter table media_items
    add column if not exists source text,
    add column if not exists external_url text,
    add column if not exists time_to_beat_minutes integer;

comment on column media_items.source is 'Origin system for the enrichment payload (tmdb, igdb, omdb, manual, etc.)';
comment on column media_items.external_url is 'Canonical link to the enriched entry (TMDb title page, IGDB game page, etc.)';
comment on column media_items.time_to_beat_minutes is 'Estimated completion time (minutes) derived from IGDB or similar sources.';

