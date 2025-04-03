-- Create tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    cover_art TEXT,
    duration TEXT,
    genre TEXT,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own tracks
CREATE POLICY "Users can view their own tracks"
    ON public.tracks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own tracks
CREATE POLICY "Users can insert their own tracks"
    ON public.tracks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tracks
CREATE POLICY "Users can update their own tracks"
    ON public.tracks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own tracks
CREATE POLICY "Users can delete their own tracks"
    ON public.tracks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update last_modified
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for last_modified
CREATE TRIGGER update_tracks_last_modified
    BEFORE UPDATE ON public.tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified(); 