# Supabase CLI Setup Guide

## Install Supabase CLI

Run this command to install the Supabase CLI:

```bash
brew install supabase/tap/supabase
```

## Link Your Project

After installing, link your local project to your Supabase project:

```bash
# Login to Supabase
supabase login

# Link to your existing project
supabase link --project-ref YOUR_PROJECT_REF
```

To find your project ref:

1. Go to your Supabase Dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
3. Or go to Settings → General → Reference ID

## Run Migrations

Once linked, you can run migrations with:

```bash
# Run the soft delete migration
supabase db push --file supabase/add_soft_delete.sql

# Or if you want to run all migrations in order
supabase db push --file supabase/schema.sql
supabase db push --file supabase/add_soft_delete.sql
```

## Alternative: Create Proper Migration Files

For better organization, you can create a migrations folder:

```bash
# Initialize migrations (creates supabase/migrations folder)
supabase migration new add_soft_delete

# Then move your SQL to the generated migration file
# Or copy the contents of add_soft_delete.sql into it

# Apply all pending migrations
supabase db push
```

## Quick Commands

```bash
# See all migrations
supabase migration list

# Create a new migration
supabase migration new migration_name

# Apply all pending migrations
supabase db push

# Pull schema changes from remote
supabase db pull

# Reset local database (if using local dev)
supabase db reset
```

## For This Project

Just run:

```bash
brew install supabase/tap/supabase
supabase login
supabase link
supabase db push --file supabase/add_soft_delete.sql
```

And you're done! 🎉
