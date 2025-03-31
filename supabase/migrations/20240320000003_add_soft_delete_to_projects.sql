-- Add soft delete columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update existing projects to have is_deleted = false
UPDATE projects SET is_deleted = FALSE WHERE is_deleted IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted);

-- Update RLS policies to only show non-deleted projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id AND is_deleted = FALSE);

-- Update the handle_updated_at function to handle deleted_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        NEW.deleted_at = TIMEZONE('utc'::text, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 