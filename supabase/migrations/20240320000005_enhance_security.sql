-- Add security headers function
CREATE OR REPLACE FUNCTION public.handle_security_headers()
RETURNS trigger AS $$
BEGIN
  -- Set security headers for all responses
  PERFORM set_config('response.headers', jsonb_build_object(
    'Strict-Transport-Security', 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options', 'nosniff',
    'X-Frame-Options', 'DENY',
    'X-XSS-Protection', '1; mode=block',
    'Content-Security-Policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline'' ''unsafe-eval''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:; font-src ''self'' data:; connect-src ''self'' https://*.supabase.co',
    'Referrer-Policy', 'strict-origin-when-cross-origin'
  )::text, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for security headers
CREATE TRIGGER set_security_headers
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_security_headers();

-- Add rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_id UUID,
  action_type TEXT,
  max_requests INTEGER,
  window_seconds INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- Get count of requests in the time window
  SELECT COUNT(*)
  INTO request_count
  FROM public.rate_limits
  WHERE user_id = $1
    AND action_type = $2
    AND created_at > NOW() - (window_seconds || ' seconds')::INTERVAL;

  -- Insert new request
  INSERT INTO public.rate_limits (user_id, action_type)
  VALUES ($1, $2);

  -- Return true if under limit
  RETURN request_count < max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type, created_at)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for rate_limits
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    action,
    old_data,
    new_data
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_sessions
  AFTER INSERT OR UPDATE OR DELETE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

-- Add password policy function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    -- At least 8 characters
    length(password) >= 8 AND
    -- Contains at least one uppercase letter
    password ~ '[A-Z]' AND
    -- Contains at least one lowercase letter
    password ~ '[a-z]' AND
    -- Contains at least one number
    password ~ '[0-9]' AND
    -- Contains at least one special character
    password ~ '[!@#$%^&*(),.?":{}|<>]'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 