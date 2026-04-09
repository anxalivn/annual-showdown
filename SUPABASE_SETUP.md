# Supabase Realtime Setup for TAGS

## 1. Create a Supabase project
- Go to https://supabase.com
- Create a free project
- Copy your **Project URL** and **anon public key**

## 2. Create local env vars
Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Create the `rooms` table
Open the Supabase SQL editor and run:

```sql
-- use supabase/schema.sql from this repo
```

That file creates:
- `public.rooms`
- public read/write policies for quick shared use
- realtime publication for the table

## 4. Restart the app
```bash
npm run dev
```

## 5. Share the room link
Open the app and click **Copy room link**.
Send that URL to your friend. If both of you open the same `?room=...` link, draft changes will sync live.

## Notes
- This is set up for a simple free shared app.
- For stronger security later, add auth and tighter room policies.
