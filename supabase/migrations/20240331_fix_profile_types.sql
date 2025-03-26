-- Fix genres column type to match Supabase types
ALTER TABLE profiles
  ALTER COLUMN genres TYPE text[] USING 
    CASE 
      WHEN genres IS NULL THEN NULL
      ELSE string_to_array(genres, ',')
    END;

-- Add comment to describe the field
COMMENT ON COLUMN profiles.genres IS 'Array of genres the user produces'; 