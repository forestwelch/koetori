# Soft Delete Migration Guide

## Step 1: Run the Migration

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/add_soft_delete.sql`
4. Click "Run" to execute the migration

This will:

- Add a `deleted_at` column to the `memos` table
- Update policies to handle soft-deleted memos
- Create a function to auto-delete old trashed items (30+ days)

## Step 2: Test the Feature

1. Restart your Next.js dev server if it's running
2. Create a new memo
3. Hover over the memo - you'll see edit ✏️ and delete 🗑️ buttons appear
4. Try editing inline (click edit, type, save/cancel)
5. Try deleting (moves to trash)
6. Click the "🗑️ Trash" filter to see deleted memos
7. In trash, you can restore or permanently delete

## Features

### Inline Editing

- Hover over any memo to see action buttons in the top-right
- Click the edit icon (✏️)
- Edit the transcript inline
- Save or cancel

### Soft Delete (Move to Trash)

- Hover over any memo and click the delete icon (🗑️)
- Memo moves to "Trash" filter
- Can be restored within 30 days
- Auto-hard-deletes after 30 days (if you enable the cron job)

### Trash Management

- Click "🗑️ Trash" filter to view deleted memos
- **Restore**: Moves memo back to active
- **Delete Forever**: Permanently deletes (asks for confirmation)

### Auto-Cleanup (Optional)

To enable automatic deletion of memos older than 30 days in trash:

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create a new cron job
3. Run: `SELECT delete_old_trashed_memos();`
4. Schedule: Daily at midnight
5. This will automatically hard-delete memos that have been in trash for 30+ days

## Notes

- Category filters only apply to active memos (not trash)
- "Needs Review" filter only applies to active memos
- Edit and delete buttons appear on hover for a clean UI
- Trash items show restore/delete actions instead of edit/delete
