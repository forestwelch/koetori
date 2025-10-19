# Phase 8 Setup Guide: Smart Categorization

This guide will help you set up AI-powered categorization with Supabase for your voice memos.

## Prerequisites

- Completed Phases 1-7
- Node.js and npm installed
- Groq API key (already configured)

---

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

---

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: koetori (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier (perfect for MVP)
5. Wait for project to finish setting up (~2 minutes)

### 2.2 Get Your API Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) in the sidebar
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (under "Project API keys")
   - **anon public** key (under "Project API keys")

### 2.3 Create the Database Table

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **+ New Query**
3. Copy the contents of `/supabase/schema.sql` into the editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

---

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local` if you haven't already:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```env
   # Existing Groq API key
   GROQ_API_KEY=your_groq_api_key_here
   
   # New Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Important**: Never commit `.env.local` to git!

---

## Step 4: Test the Setup

### 4.1 Start the Development Server

```bash
npm run dev
```

### 4.2 Test Recording with Categorization

1. Open `http://localhost:3000`
2. Click the microphone button or press Space
3. Say something like:
   - **Media test**: "My friend recommended I watch Blade Runner 2049"
   - **Event test**: "Tomorrow I'm meeting Sarah at 3pm at Starbucks"
   - **Journal test**: "Today was a good day, feeling grateful"
   - **Todo test**: "I need to buy groceries and call the dentist"

4. Stop the recording
5. You should see:
   - ✅ The transcription
   - ✅ A colored category badge (e.g., 🎬 media)
   - ✅ Confidence score with progress bar
   - ✅ Extracted data (title, people, when, where, etc.)
   - ✅ Generated tags

### 4.3 Verify Data in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor** in the sidebar
3. Click the **memos** table
4. You should see your recorded memo with all the categorization data!

---

## Step 5: Troubleshooting

### "Missing Supabase environment variables" Error

- Make sure `.env.local` exists and has both:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding env variables

### Transcription Works But No Categorization

- Check browser console for errors
- Verify Groq API key is still valid
- Check API response in Network tab (should include `category`, `confidence`, etc.)

### "Failed to save memo to Supabase" in Console

- Verify the `memos` table exists in Supabase
- Check that RLS (Row Level Security) policy allows inserts
- Verify your Supabase credentials are correct

### No Extracted Data Showing

- This is normal for some memo types
- The AI only extracts data when it's confident
- Try more specific recordings with clear information

---

## What's Next?

You now have a fully functional AI-powered voice memo system! Here's what you can do:

### Immediate Next Steps

1. **Test different memo types**: Try all 8 categories
2. **Review low-confidence memos**: Check items flagged for review
3. **Explore the database**: Look at the extracted data in Supabase

### Phase 8 Remaining Features

- [ ] Create history/review page (`/history`)
- [ ] Add filtering by category
- [ ] Add search functionality
- [ ] Manual category editing
- [ ] Export capabilities

### Future Enhancements

- Calendar integration for events
- Weekly digest emails
- Tarot card repository
- Advanced search and filters
- Mobile app (React Native)

---

## Cost Monitoring

### Free Tier Limits

**Groq**:
- 14,400 requests/day
- Each memo uses 2 requests (transcription + categorization)
- = ~7,200 memos per day (way more than you need!)

**Supabase**:
- 500 MB database
- 2 GB bandwidth
- 50 MB file storage (not used yet)
- Unlimited API requests

### Estimated Usage

- Average memo: ~200 bytes
- 500 MB = ~2.5 million memos
- You're nowhere near the limits!

---

## Support

If you run into issues:

1. Check the browser console for errors
2. Check the terminal/server console for API errors
3. Verify all environment variables are set
4. Make sure you're on the latest code (git pull)

Happy recording! 🎙️✨
