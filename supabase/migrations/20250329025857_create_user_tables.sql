-- Create the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_progress ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User metrics policies
CREATE POLICY "Users can view their own metrics"
    ON user_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
    ON user_metrics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
    ON user_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Category progress policies
CREATE POLICY "Users can view their own category progress"
    ON category_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own category progress"
    ON category_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category progress"
    ON category_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
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

-- Insert default preferences and metrics for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_metrics (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
