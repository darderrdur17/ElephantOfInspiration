# Supabase Setup & Configuration Guide

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `elephant-puzzle` (or your choice)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to your users
5. Wait ~2 minutes for project creation

### Step 2: Get API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Configure Environment Variables

1. In `webapp/` directory, create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Restart your dev server after adding env vars:
   ```bash
   npm run dev
   ```

### Step 4: Run Database Migration

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy entire contents of `supabase/migrations/001_init.sql`
4. Paste and click **"Run"**
5. Verify tables were created: Go to **Database** → **Tables**

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 5: Enable Realtime

1. Go to **Database** → **Replication**
2. Find `placements` table → Toggle **"Enable"**
3. Find `scores` table → Toggle **"Enable"**
4. Or the migration will attempt to enable automatically

### Step 6: Verify Connection

1. Start dev server: `npm run dev`
2. Open browser console (F12)
3. Look for: `✅ Supabase configured and ready`
4. In the app, check top-right corner for connection status:
   - 🟢 **Live** = Connected and syncing
   - ⚪ **Local** = Not configured (works offline)
   - 🔴 **Error** = Connection issue

## Testing Realtime Sync

1. Open the app in **two browser windows** (or incognito)
2. Join the **same game room** in both
3. Drop a piece in one window
4. It should appear in the other window instantly ✨

## Database Schema

The migration creates these tables:

- **games**: Game rooms/sessions
- **players**: Players in each game  
- **puzzle_pieces**: Available puzzle pieces
- **placements**: Where players placed pieces (realtime enabled)
- **scores**: Leaderboard scores (realtime enabled)

## Troubleshooting

### "Supabase client not initialized"

**Solution**: 
- Check `.env.local` exists and has correct keys
- Restart dev server: `npm run dev`
- Verify keys in Supabase dashboard → Settings → API

### "Realtime not working"

**Solution**:
- Enable Realtime in Database → Replication
- Check browser console for errors
- Verify RLS policies allow access (migration sets public access)

### "Tables don't exist"

**Solution**:
- Run migration SQL in Supabase SQL Editor
- Check Database → Tables to verify creation
- Look for errors in SQL Editor output

### Connection Status Shows "Error"

**Solution**:
- Check `.env.local` has correct URL and key
- Verify Supabase project is active
- Check browser console for specific error
- Try regenerating anon key in Supabase dashboard

### Works Locally But Not in Production

**Solution**:
- Add env vars in Vercel dashboard:
  - Settings → Environment Variables
  - Add `NEXT_PUBLIC_SUPABASE_URL`
  - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after adding vars

## Security Notes

**Current Setup**: Public read/write (for classroom use)

**For Production**:
- Add Supabase Auth for user authentication
- Update RLS policies to restrict by user_id
- Add rate limiting
- Use service role key only on server-side

## Features Enabled

✅ **Realtime Sync**: Placements sync across all players  
✅ **Persistent Scores**: Leaderboard saved to database  
✅ **Game State**: Placements persist across sessions  
✅ **Multi-Player**: 20-30 players can play simultaneously  

## Next Steps

- Test with multiple players in same room
- Check Supabase dashboard → Database → Tables for data
- Monitor Realtime usage in Supabase dashboard
- Set up authentication if needed for production


