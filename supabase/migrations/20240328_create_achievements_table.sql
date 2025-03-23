-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    current INTEGER NOT NULL DEFAULT 0,
    target INTEGER NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own achievements
CREATE POLICY "Users can view their own achievements"
    ON public.achievements
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own achievements
CREATE POLICY "Users can insert their own achievements"
    ON public.achievements
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own achievements
CREATE POLICY "Users can update their own achievements"
    ON public.achievements
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own achievements
CREATE POLICY "Users can delete their own achievements"
    ON public.achievements
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS achievements_type_idx ON public.achievements(type);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_achievements_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default achievements
INSERT INTO public.achievements (user_id, type, description, current, target, icon, color)
SELECT 
    id,
    'Beat Making Master',
    'Create 100+ beats',
    0,
    100,
    '🎵',
    '#FF6B6B'
FROM auth.users
WHERE raw_user_meta_data->>'isGuest' = 'false';

INSERT INTO public.achievements (user_id, type, description, current, target, icon, color)
SELECT 
    id,
    'Productivity Streak',
    '7 days in a row',
    0,
    7,
    '🔥',
    '#FFA726'
FROM auth.users
WHERE raw_user_meta_data->>'isGuest' = 'false';

INSERT INTO public.achievements (user_id, type, description, current, target, icon, color)
SELECT 
    id,
    'Genre Explorer',
    'Create beats in 5 different genres',
    0,
    5,
    '⭐',
    '#66BB6A'
FROM auth.users
WHERE raw_user_meta_data->>'isGuest' = 'false'; 