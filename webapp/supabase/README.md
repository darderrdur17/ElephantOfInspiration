# Supabase Setup Guide

## Quick Start

1. **Create a Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details (name, database password, region)
   - Wait for project to be ready (~2 minutes)

2. **Get Your API Keys**
   - Go to Settings > API
   - Copy your Project URL and anon/public key
   - Add them to `.env.local` (see `.env.example`)

3. **Run Database Migrations**
   - Option A: Using Supabase Dashboard
     - Go to SQL Editor
     - Copy contents of `supabase/migrations/001_init.sql`
     - Paste and run
   
   - Option B: Using Supabase CLI (if installed)
     ```bash
     supabase db push
     ```

4. **Enable Realtime**
   - Go to Database > Replication
   - Enable replication for `placements` table
   - Enable replication for `scores` table
   - Or run the migration which attempts to enable it automatically

5. **Test the Connection**
   - Start your dev server: `npm run dev`
   - Open the app and check browser console for any Supabase errors
   - Try creating a game room and placing pieces

## Database Schema

- **games**: Game rooms/sessions
- **players**: Players in each game
- **puzzle_pieces**: Available puzzle pieces (quotes/titles)
- **placements**: Where players placed pieces
- **scores**: Leaderboard scores

## Realtime Features

The app uses Supabase Realtime for:
- Live placement updates (when players drop pieces)
- Score broadcasts (when game completes)
- Game reset events (Game Master only)

## Troubleshooting

**"Supabase client not initialized"**
- Check `.env.local` has correct keys
- Restart dev server after adding env vars

**"Realtime not working"**
- Enable Realtime in Database > Replication
- Check browser console for connection errors
- Verify RLS policies allow access

**"Tables don't exist"**
- Run the migration SQL in Supabase SQL Editor
- Check Database > Tables to verify tables were created

## Security Notes

Current RLS policies allow public read/write. For production:
- Add authentication (Supabase Auth)
- Restrict policies by user_id or game_id
- Add rate limiting

