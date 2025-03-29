-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    artist_name TEXT,
    genres TEXT,
    daw TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    website TEXT,
    birthday TEXT,
    timezone TEXT DEFAULT 'UTC',
    productivity_score INTEGER DEFAULT 0,
    total_beats INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    completion_rate NUMERIC DEFAULT 0,
    social_links JSONB DEFAULT '{}'::jsonb,
    notification_preferences JSONB DEFAULT '{"newFollowers": true, "beatComments": true, "collaborationRequests": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Insert default profiles for existing users
INSERT INTO profiles (id, username, full_name)
SELECT id, email, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;
