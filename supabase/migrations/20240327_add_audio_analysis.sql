-- Add audio analysis fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS audio_analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS audio_duration FLOAT,
ADD COLUMN IF NOT EXISTS audio_loudness FLOAT;

-- Update existing projects to have audio_analyzed set to false
UPDATE projects SET audio_analyzed = FALSE WHERE audio_analyzed IS NULL;

-- Add RLS policies for the new columns
ALTER POLICY "Users can update their own projects"
ON projects
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 