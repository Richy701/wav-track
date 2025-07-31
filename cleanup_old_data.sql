-- WavTrack Data Cleanup Script
-- Run this in your Supabase SQL Editor to free up space

-- 1. Clean up old audit logs (keep only last 30 days)
DELETE FROM public.audit_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 2. Clean up old rate limits (keep only last 7 days)
DELETE FROM public.rate_limits 
WHERE created_at < NOW() - INTERVAL '7 days';

-- 3. Clean up old cached quotes (keep only last 7 days)
DELETE FROM public.cached_quotes 
WHERE created_at < NOW() - INTERVAL '7 days';

-- 4. Clean up soft-deleted projects older than 90 days
UPDATE public.projects 
SET is_deleted = TRUE, deleted_at = NOW() 
WHERE is_deleted = FALSE 
AND last_modified < NOW() - INTERVAL '90 days'
AND status = 'completed';

-- 5. Clean up old session data (keep only last 60 days)
DELETE FROM public.sessions 
WHERE created_at < NOW() - INTERVAL '60 days';

-- 6. Clean up old beat activities (keep only last 90 days)
DELETE FROM public.beat_activities 
WHERE created_at < NOW() - INTERVAL '90 days';

-- 7. Clean up old session goals (keep only last 60 days)
DELETE FROM public.session_goals 
WHERE created_at < NOW() - INTERVAL '60 days';

-- 8. Clean up old category progress (keep only last 30 days)
DELETE FROM public.category_progress 
WHERE date < CURRENT_DATE - INTERVAL '30 days';

-- 9. Clean up audio files from deleted projects
-- Note: This requires the cleanup functions from cleanup_orphaned_audio.sql
DO $$
BEGIN
  -- Check if cleanup functions exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_deleted_project_audio') THEN
    PERFORM cleanup_deleted_project_audio();
    RAISE NOTICE 'Audio files from deleted projects cleaned up';
  ELSE
    RAISE NOTICE 'Audio cleanup functions not found. Run cleanup_orphaned_audio.sql first.';
  END IF;
END $$;

-- Show cleanup results
SELECT 
  'audit_logs' as table_name,
  COUNT(*) as remaining_records
FROM public.audit_logs
UNION ALL
SELECT 
  'rate_limits' as table_name,
  COUNT(*) as remaining_records
FROM public.rate_limits
UNION ALL
SELECT 
  'sessions' as table_name,
  COUNT(*) as remaining_records
FROM public.sessions
UNION ALL
SELECT 
  'beat_activities' as table_name,
  COUNT(*) as remaining_records
FROM public.beat_activities
UNION ALL
SELECT 
  'audio_files' as table_name,
  COUNT(*) as remaining_records
FROM storage.objects 
WHERE bucket_id = 'project-audio'; 