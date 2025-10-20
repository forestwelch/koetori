# 🚀 Deploying Koetori to Vercel with Supabase

## Prerequisites

- [ ] GitHub account with this repository
- [ ] Vercel account (free tier is fine)
- [ ] Supabase account with a project created
- [ ] Groq API key

---

## Step 1: Setup Supabase Database

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project (choose a region close to you)
3. Wait for the database to be provisioned (~2 minutes)

### 1.2 Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link to your project (find project ref in Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

**Option B: Using Supabase SQL Editor (Manual)**

1. Go to your Supabase dashboard → SQL Editor
2. Copy and run the contents of these files IN ORDER:
   - `supabase/schema.sql`
   - `supabase/add_soft_delete.sql`
   - `supabase/migrations/20241018000001_add_starred.sql`

### 1.3 Get Your Supabase Credentials

1. Go to your Supabase Dashboard
2. Click on Settings (gear icon) → API
3. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

---

## Step 2: Get Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

---

## Step 3: Deploy to Vercel

### 3.1 Connect Repository to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`forestwelch/koetori`)
4. Click "Import"

### 3.2 Configure Environment Variables

Before deploying, add these environment variables in Vercel:

| Variable Name                   | Value                     | Where to Get It                     |
| ------------------------------- | ------------------------- | ----------------------------------- |
| `GROQ_API_KEY`                  | Your Groq API key         | https://console.groq.com/keys       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key    | Supabase Dashboard → Settings → API |

**To add them:**

1. In Vercel's import screen, expand "Environment Variables"
2. Add each variable with its value
3. Make sure they're available for "Production" environment

### 3.3 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. Get your deployment URL (e.g., `koetori.vercel.app`)

---

## Step 4: Test Your Deployment

Visit your Vercel URL and test:

- [ ] Click the record button
- [ ] Record a voice memo (try: "Buy groceries tomorrow")
- [ ] Verify transcription appears
- [ ] Check that memo is saved to Supabase
- [ ] Test swipe gestures (on mobile or touch device)
- [ ] Try starring a memo
- [ ] Test archiving
- [ ] Click logo to see random memo

---

## Step 5: Verify Database

1. Go to Supabase Dashboard → Table Editor
2. Check the `memos` table
3. You should see your test memo with:
   - `transcript` (your voice memo text)
   - `category` (AI-detected category)
   - `confidence` (AI confidence score)
   - `starred` (boolean)
   - `deleted_at` (null for active memos)

---

## Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### "Invalid API Key" Error

- Verify `GROQ_API_KEY` is set correctly in Vercel
- Make sure it starts with `gsk_`
- Check if key has been revoked

### "Supabase Connection Failed"

- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct (includes `https://`)
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon** key, not service role
- Check that RLS policies are set correctly (should be disabled for testing)

### Memos Not Saving

- Check Supabase Dashboard → Database → Tables → `memos`
- Verify migrations ran successfully
- Check browser console for errors
- Verify all required columns exist: `transcript`, `category`, `confidence`, `starred`, `deleted_at`

### Transcription Not Working

- Check Groq API rate limits (free tier: 30 requests/minute)
- Verify audio recording permissions in browser
- Try a shorter recording first
- Check Vercel logs for API errors

---

## Useful Commands

```bash
# Deploy from CLI (optional)
npm i -g vercel
vercel --prod

# Check Vercel logs
vercel logs

# Add environment variable via CLI
vercel env add GROQ_API_KEY

# Local development with production env
vercel env pull .env.local
npm run dev

# Check Supabase migrations
supabase migration list

# Create new migration
supabase migration new migration_name
```

---

## Post-Deployment

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Analytics (Optional)

- Vercel provides built-in analytics
- Enable in: Project Settings → Analytics

### Monitoring

- Check Vercel Dashboard for build/deployment status
- Monitor Groq API usage at https://console.groq.com
- Check Supabase Dashboard for database usage

---

## Cost Estimate

| Service   | Plan      | Cost                                          |
| --------- | --------- | --------------------------------------------- |
| Vercel    | Hobby     | **Free** (generous limits)                    |
| Supabase  | Free Tier | **Free** (500MB database, 50k requests/month) |
| Groq      | Free Tier | **Free** (with rate limits)                   |
| **Total** |           | **$0/month** for moderate usage               |

### If You Need to Scale:

- **Vercel Pro**: $20/month (better performance, more bandwidth)
- **Supabase Pro**: $25/month (8GB database, 500k requests/month)
- **Groq**: Contact for pricing on higher limits

---

## Quick Start (TL;DR)

```bash
# 1. Setup Supabase
brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR_REF
supabase db push

# 2. Deploy to Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Add 3 environment variables
# - Click Deploy

# Done! 🎉
```

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Groq Docs**: https://console.groq.com/docs
- **Project Issues**: https://github.com/forestwelch/koetori/issues
