-- Add description column to session_goals table
ALTER TABLE public.session_goals
ADD COLUMN IF NOT EXISTS description TEXT; 