-- Add display_order field to shopping_list_items for drag-to-reorder functionality
alter table shopping_list_items
    add column if not exists display_order integer default 0;

-- Create index for efficient ordering queries
create index if not exists shopping_list_items_display_order_idx 
    on shopping_list_items (status, display_order);

-- Initialize display_order based on created_at for existing items
-- This ensures all existing items have a unique order
update shopping_list_items
set display_order = subquery.row_number
from (
    select 
        id,
        row_number() over (partition by status order by created_at) as row_number
    from shopping_list_items
) as subquery
where shopping_list_items.id = subquery.id;

COMMENT ON COLUMN shopping_list_items.display_order IS 'Display order within status group (open, purchased, archived) for drag-to-reorder';

