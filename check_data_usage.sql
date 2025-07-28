-- WavTrack Data Usage Check (SAFE - READ ONLY)
-- Run this first to see what's consuming your quota

-- 1. Check audit logs usage
SELECT 
  'audit_logs' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.001 as estimated_mb
FROM public.audit_logs
UNION ALL
SELECT 
  'audit_logs_old' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.001 as estimated_mb
FROM public.audit_logs 
WHERE created_at < NOW() - INTERVAL '30 days'
UNION ALL

-- 2. Check rate limits usage
SELECT 
  'rate_limits' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.0005 as estimated_mb
FROM public.rate_limits
UNION ALL
SELECT 
  'rate_limits_old' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.0005 as estimated_mb
FROM public.rate_limits 
WHERE created_at < NOW() - INTERVAL '7 days'
UNION ALL

-- 3. Check sessions usage
SELECT 
  'sessions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.002 as estimated_mb
FROM public.sessions
UNION ALL
SELECT 
  'sessions_old' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.002 as estimated_mb
FROM public.sessions 
WHERE created_at < NOW() - INTERVAL '60 days'
UNION ALL

-- 4. Check beat activities usage
SELECT 
  'beat_activities' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.001 as estimated_mb
FROM public.beat_activities
UNION ALL
SELECT 
  'beat_activities_old' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.001 as estimated_mb
FROM public.beat_activities 
WHERE created_at < NOW() - INTERVAL '90 days'
UNION ALL

-- 5. Check projects usage
SELECT 
  'projects' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.005 as estimated_mb
FROM public.projects
UNION ALL

-- 6. Check user subscriptions
SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) * 0.001 as estimated_mb
FROM public.user_subscriptions;

-- Show total estimated usage
SELECT 
  'TOTAL ESTIMATED USAGE' as summary,
  SUM(estimated_mb) as total_mb
FROM (
  SELECT COUNT(*) * 0.001 as estimated_mb FROM public.audit_logs
  UNION ALL
  SELECT COUNT(*) * 0.0005 as estimated_mb FROM public.rate_limits
  UNION ALL
  SELECT COUNT(*) * 0.002 as estimated_mb FROM public.sessions
  UNION ALL
  SELECT COUNT(*) * 0.001 as estimated_mb FROM public.beat_activities
  UNION ALL
  SELECT COUNT(*) * 0.005 as estimated_mb FROM public.projects
  UNION ALL
  SELECT COUNT(*) * 0.001 as estimated_mb FROM public.user_subscriptions
) as usage_data; 