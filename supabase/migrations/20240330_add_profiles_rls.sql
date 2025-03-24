-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON profiles
    FOR DELETE
    USING (auth.uid() = id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id); 