-- WavTrack Audio File Cleanup Script
-- Run this in your Supabase SQL Editor to clean up orphaned audio files

-- Function to clean up orphaned audio files from deleted projects
CREATE OR REPLACE FUNCTION cleanup_orphaned_audio_files()
RETURNS TABLE(deleted_files text[], deleted_count bigint) AS $$
DECLARE
    audio_file text;
    deleted_files text[] := '{}';
    deleted_count bigint := 0;
BEGIN
    -- Get all audio files from storage that don't have corresponding active projects
    FOR audio_file IN
        SELECT name 
        FROM storage.objects 
        WHERE bucket_id = 'project-audio'
        AND name NOT IN (
            SELECT DISTINCT 
                CASE 
                    WHEN audio_url LIKE '%/project-audio/%' 
                    THEN substring(audio_url from 'project-audio/(.+)')
                    ELSE NULL 
                END
            FROM projects 
            WHERE is_deleted = FALSE 
            AND audio_url IS NOT NULL
        )
        AND name IS NOT NULL
    LOOP
        -- Delete the orphaned file
        DELETE FROM storage.objects 
        WHERE bucket_id = 'project-audio' 
        AND name = audio_file;
        
        -- Track deleted files
        deleted_files := array_append(deleted_files, audio_file);
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT deleted_files, deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audio files (older than 1 year) from inactive projects
CREATE OR REPLACE FUNCTION cleanup_old_audio_files()
RETURNS TABLE(deleted_files text[], deleted_count bigint) AS $$
DECLARE
    audio_file text;
    deleted_files text[] := '{}';
    deleted_count bigint := 0;
BEGIN
    -- Get audio files from projects that haven't been modified in over 1 year
    FOR audio_file IN
        SELECT DISTINCT 
            CASE 
                WHEN p.audio_url LIKE '%/project-audio/%' 
                THEN substring(p.audio_url from 'project-audio/(.+)')
                ELSE NULL 
            END
        FROM projects p
        WHERE p.last_modified < NOW() - INTERVAL '1 year'
        AND p.audio_url IS NOT NULL
        AND p.is_deleted = FALSE
    LOOP
        -- Delete the old file
        DELETE FROM storage.objects 
        WHERE bucket_id = 'project-audio' 
        AND name = audio_file;
        
        -- Track deleted files
        deleted_files := array_append(deleted_files, audio_file);
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT deleted_files, deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up audio files from soft-deleted projects
CREATE OR REPLACE FUNCTION cleanup_deleted_project_audio()
RETURNS TABLE(deleted_files text[], deleted_count bigint) AS $$
DECLARE
    audio_file text;
    deleted_files text[] := '{}';
    deleted_count bigint := 0;
BEGIN
    -- Get audio files from soft-deleted projects
    FOR audio_file IN
        SELECT DISTINCT 
            CASE 
                WHEN p.audio_url LIKE '%/project-audio/%' 
                THEN substring(p.audio_url from 'project-audio/(.+)')
                ELSE NULL 
            END
        FROM projects p
        WHERE p.is_deleted = TRUE
        AND p.audio_url IS NOT NULL
    LOOP
        -- Delete the file
        DELETE FROM storage.objects 
        WHERE bucket_id = 'project-audio' 
        AND name = audio_file;
        
        -- Track deleted files
        deleted_files := array_append(deleted_files, audio_file);
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT deleted_files, deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute cleanup functions and show results
DO $$
DECLARE
    orphaned_result record;
    old_result record;
    deleted_result record;
BEGIN
    -- Clean up orphaned files
    SELECT * INTO orphaned_result FROM cleanup_orphaned_audio_files();
    
    -- Clean up old files
    SELECT * INTO old_result FROM cleanup_old_audio_files();
    
    -- Clean up deleted project files
    SELECT * INTO deleted_result FROM cleanup_deleted_project_audio();
    
    -- Show results
    RAISE NOTICE 'Cleanup Results:';
    RAISE NOTICE 'Orphaned files deleted: %', orphaned_result.deleted_count;
    RAISE NOTICE 'Old files deleted: %', old_result.deleted_count;
    RAISE NOTICE 'Deleted project files: %', deleted_result.deleted_count;
    RAISE NOTICE 'Total files deleted: %', 
        orphaned_result.deleted_count + old_result.deleted_count + deleted_result.deleted_count;
END $$;

-- Show remaining audio files and their associated projects
SELECT 
    'Remaining Audio Files' as status,
    COUNT(*) as count
FROM storage.objects 
WHERE bucket_id = 'project-audio'
UNION ALL
SELECT 
    'Projects with Audio' as status,
    COUNT(*) as count
FROM projects 
WHERE audio_url IS NOT NULL 
AND is_deleted = FALSE; 