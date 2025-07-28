-- Clean up cover art references from database
-- Run this in your Supabase SQL Editor

-- Remove cover_art column from tracks table if it exists
ALTER TABLE public.tracks DROP COLUMN IF EXISTS cover_art;

-- Remove cover_art column from projects table if it exists  
ALTER TABLE public.projects DROP COLUMN IF EXISTS cover_art;

-- Clean up any other cover art related columns
ALTER TABLE public.projects DROP COLUMN IF EXISTS cover_art_url;

-- Show success message
SELECT 'Cover art cleanup completed!' as status; 