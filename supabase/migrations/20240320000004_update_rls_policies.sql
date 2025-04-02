-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can soft delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can batch soft delete their own projects" ON projects;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create updated policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create soft delete policy
CREATE POLICY "Users can soft delete their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Allow setting is_deleted to true
      (is_deleted = TRUE) OR
      -- Allow keeping is_deleted as is
      (is_deleted = is_deleted) OR
      -- Allow updating other fields while keeping is_deleted as is
      (is_deleted = is_deleted)
    )
  );

-- Add a specific policy for batch soft delete
CREATE POLICY "Users can batch soft delete their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    is_deleted = TRUE AND
    deleted_at IS NOT NULL
  ); 