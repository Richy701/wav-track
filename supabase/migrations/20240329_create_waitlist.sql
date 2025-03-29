-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist
CREATE POLICY "Allow public insert to waitlist" ON waitlist
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Only allow authenticated users to view waitlist entries
CREATE POLICY "Allow authenticated users to view waitlist" ON waitlist
    FOR SELECT
    TO authenticated
    USING (true); 