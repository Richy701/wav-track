-- Create cached_quotes table
CREATE TABLE IF NOT EXISTS cached_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  song_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cached_quotes_created_at ON cached_quotes(created_at DESC);

-- Add RLS policies
ALTER TABLE cached_quotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached quotes
CREATE POLICY "Allow public read access to cached quotes"
  ON cached_quotes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only allow authenticated users to insert quotes
CREATE POLICY "Allow authenticated users to insert cached quotes"
  ON cached_quotes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only allow authenticated users to delete quotes
CREATE POLICY "Allow authenticated users to delete cached quotes"
  ON cached_quotes FOR DELETE
  TO authenticated
  USING (true); 