-- Add missing columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS artist_name text,
  ADD COLUMN IF NOT EXISTS genres text,
  ADD COLUMN IF NOT EXISTS daw text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS birthday text,
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS productivity_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_beats integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_projects integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"newFollowers": true, "beatComments": true, "collaborationRequests": true}'::jsonb;

