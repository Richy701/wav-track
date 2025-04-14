-- Create waitlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert into waitlist
CREATE POLICY "Anyone can join waitlist"
    ON public.waitlist FOR INSERT
    WITH CHECK (true);

-- Create policy to allow only authenticated users to view waitlist
CREATE POLICY "Only authenticated users can view waitlist"
    ON public.waitlist FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON public.waitlist(email);

-- Add comment to table
COMMENT ON TABLE public.waitlist IS 'Stores emails of users who have joined the waitlist'; 