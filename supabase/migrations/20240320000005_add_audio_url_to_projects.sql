-- Add audio_url column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Migrate existing audio_file data to audio_url
UPDATE projects
SET audio_url = (audio_file->>'url')::TEXT
WHERE audio_file IS NOT NULL AND audio_file->>'url' IS NOT NULL;

-- Drop the old audio_file column
ALTER TABLE projects
DROP COLUMN IF EXISTS audio_file; 