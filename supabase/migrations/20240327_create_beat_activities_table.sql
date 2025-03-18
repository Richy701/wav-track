-- Create beat_activities table
CREATE TABLE IF NOT EXISTS public.beat_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.beat_activities ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own beat activities
CREATE POLICY "Users can view their own beat activities"
    ON public.beat_activities
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own beat activities
CREATE POLICY "Users can insert their own beat activities"
    ON public.beat_activities
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own beat activities
CREATE POLICY "Users can update their own beat activities"
    ON public.beat_activities
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own beat activities
CREATE POLICY "Users can delete their own beat activities"
    ON public.beat_activities
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS beat_activities_user_id_idx ON public.beat_activities(user_id);
CREATE INDEX IF NOT EXISTS beat_activities_project_id_idx ON public.beat_activities(project_id);
CREATE INDEX IF NOT EXISTS beat_activities_date_idx ON public.beat_activities(date);
CREATE INDEX IF NOT EXISTS beat_activities_timestamp_idx ON public.beat_activities(timestamp); 