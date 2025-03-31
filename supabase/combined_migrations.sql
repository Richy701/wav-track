-- Create the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    artist_name TEXT,
    genres JSONB DEFAULT '[]'::jsonb,
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

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles';
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    duration INTEGER DEFAULT 25,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    goals JSONB DEFAULT '[]'::jsonb,
    bpm INTEGER,
    key TEXT,
    genre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions';
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create sessions policies
CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for sessions updated_at
DROP TRIGGER IF EXISTS set_updated_at ON sessions;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_duration INTEGER DEFAULT 25,
    preferred_categories TEXT[] DEFAULT '{}',
    preferred_genres TEXT[] DEFAULT '{}',
    skill_level TEXT DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create user_metrics table
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    productivity_score FLOAT DEFAULT 0 CHECK (productivity_score >= 0 AND productivity_score <= 1),
    streak_count INTEGER DEFAULT 0,
    skill_progress FLOAT DEFAULT 0 CHECK (skill_progress >= 0 AND skill_progress <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create category_progress table
CREATE TABLE IF NOT EXISTS category_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    improvement FLOAT DEFAULT 0 CHECK (improvement >= 0 AND improvement <= 1),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, category, date)
);

-- Enable RLS for remaining tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist for user_preferences
DO $$ BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences';
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Drop existing policies if they exist for user_metrics
DO $$ BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own metrics" ON user_metrics';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own metrics" ON user_metrics';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own metrics" ON user_metrics';
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create policies for user_metrics
CREATE POLICY "Users can view their own metrics"
    ON user_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
    ON user_metrics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
    ON user_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Drop existing policies if they exist for category_progress
DO $$ BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own category progress" ON category_progress';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own category progress" ON category_progress';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own category progress" ON category_progress';
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create policies for category_progress
CREATE POLICY "Users can view their own category progress"
    ON category_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own category progress"
    ON category_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category progress"
    ON category_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS set_updated_at ON user_metrics;
DROP TRIGGER IF EXISTS set_updated_at ON category_progress;

-- Create triggers for remaining tables
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_metrics
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON category_progress
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Insert default data for existing users
INSERT INTO profiles (id, full_name)
SELECT id, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_metrics (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING; 