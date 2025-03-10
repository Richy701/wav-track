-- Add missing profile fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS artist_name text,
  ADD COLUMN IF NOT EXISTS genres text,
  ADD COLUMN IF NOT EXISTS daw text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"newFollowers": true, "beatComments": true, "collaborationRequests": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS productivity_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_beats integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_projects integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_rate numeric DEFAULT 0;

-- Add comments to describe the fields
COMMENT ON COLUMN profiles.beats_created IS 'Number of beats created by the user';
COMMENT ON COLUMN profiles.social_links IS 'JSON object containing social media links and usernames';
COMMENT ON COLUMN profiles.notification_preferences IS 'JSON object containing notification settings';
COMMENT ON COLUMN profiles.productivity_score IS 'Overall productivity score based on activity';
COMMENT ON COLUMN profiles.total_beats IS 'Total number of beats created';
COMMENT ON COLUMN profiles.completed_projects IS 'Number of completed projects';
COMMENT ON COLUMN profiles.completion_rate IS 'Project completion rate percentage'; 