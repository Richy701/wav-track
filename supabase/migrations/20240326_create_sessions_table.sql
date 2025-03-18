-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own sessions
CREATE POLICY "Users can view their own sessions"
    ON public.sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own sessions
CREATE POLICY "Users can insert their own sessions"
    ON public.sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own sessions
CREATE POLICY "Users can update their own sessions"
    ON public.sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own sessions
CREATE POLICY "Users can delete their own sessions"
    ON public.sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_project_id_idx ON public.sessions(project_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON public.sessions(created_at); 