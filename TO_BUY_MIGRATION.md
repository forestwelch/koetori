# 🛒 Adding "To Buy" Category - Database Migration

## Problem

You're seeing this error when trying to use "to buy" category:

```
"new row for relation \"memos\" violates check constraint \"memos_category_check\""
```

This is because the database has a CHECK constraint that only allows the old 8 categories, not the new "to buy" category.

## Solution: Run the Migration

### Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add "to buy" category to the check constraint

-- First, drop the old constraint
ALTER TABLE memos DROP CONSTRAINT IF EXISTS memos_category_check;

-- Add new constraint with "to buy" included
ALTER TABLE memos ADD CONSTRAINT memos_category_check
  CHECK (category IN ('media', 'event', 'journal', 'therapy', 'tarot', 'todo', 'idea', 'to buy', 'other'));
```

5. Click **Run** or press `Cmd/Ctrl + Enter`
6. You should see "Success. No rows returned"

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI linked
supabase db push

# Or run the specific migration
supabase migration up
```

### Option 3: Manual SQL File

The migration is saved here:

```
supabase/migrations/20241019000002_add_to_buy_category.sql
```

## Verify It Worked

After running the migration:

1. Refresh your app
2. Click a category badge dropdown
3. You should see "🛒 To Buy" in the list
4. Try changing a memo to "to buy" category
5. It should save without errors!

## What This Does

**Before:**

```sql
CHECK (category IN ('media', 'event', 'journal', 'therapy', 'tarot', 'todo', 'idea', 'other'))
-- Only 8 categories allowed ❌
```

**After:**

```sql
CHECK (category IN ('media', 'event', 'journal', 'therapy', 'tarot', 'todo', 'idea', 'to buy', 'other'))
-- Now 9 categories allowed ✅
```

## Troubleshooting

**"constraint does not exist" error:**

- That's OK! It means the constraint name might be different
- The `IF EXISTS` prevents errors

**Still getting check constraint error:**

- Make sure you ran the SQL in the correct database
- Check your Supabase project is the one your app connects to
- Verify the table is called `memos`

**Migration file not found:**

- The file is in: `supabase/migrations/20241019000002_add_to_buy_category.sql`
- You can copy the SQL directly from there

## After Migration

Once the migration runs successfully:

✅ "To Buy" will appear in dropdown
✅ Can categorize memos as "to buy"
✅ AI will suggest "to buy" for shopping lists
✅ No more database errors!

---

**Need help?** Check the Supabase logs or console for any error messages.
