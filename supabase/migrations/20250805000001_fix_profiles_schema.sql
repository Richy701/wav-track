-- Fix profiles table schema to match application expectations
-- Add missing columns and rename existing ones

-- First, add the missing columns if they don't exist
DO $$ 
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE profiles ADD COLUMN name TEXT;
    END IF;
    
    -- Add missing streak columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_streak') THEN
        ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'best_streak') THEN
        ALTER TABLE profiles ADD COLUMN best_streak INTEGER DEFAULT 0;
    END IF;
    
    -- Add join_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'join_date') THEN
        ALTER TABLE profiles ADD COLUMN join_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Migrate data from old columns to new ones
UPDATE profiles SET 
    name = full_name,
    email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE name IS NULL OR email IS NULL;

-- Set join_date for existing profiles
UPDATE profiles SET join_date = created_at WHERE join_date IS NULL;

-- Drop the old columns (optional - commented out for safety)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS username;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;