-- Create creative_notes table
CREATE TABLE IF NOT EXISTS creative_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('idea', 'reminder')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS creative_notes_user_id_idx ON creative_notes(user_id);
CREATE INDEX IF NOT EXISTS creative_notes_created_at_idx ON creative_notes(created_at);
CREATE INDEX IF NOT EXISTS creative_notes_type_idx ON creative_notes(type);

-- Enable RLS (Row Level Security)
ALTER TABLE creative_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own creative notes" ON creative_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creative notes" ON creative_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creative notes" ON creative_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creative notes" ON creative_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creative_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_creative_notes_updated_at_trigger
    BEFORE UPDATE ON creative_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_creative_notes_updated_at();