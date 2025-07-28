-- WavTrack Payment System Setup
-- Run this in your Supabase SQL Editor

-- 1. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, plan_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view their own subscriptions" 
    ON public.user_subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
    ON public.user_subscriptions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
    ON public.user_subscriptions 
    FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 4. Create function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at() 
RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.updated_at = TIMEZONE('utc'::text, NOW()); 
    RETURN NEW; 
END; 
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON public.user_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_subscription_updated_at();

-- 5. Create subscription management functions
CREATE OR REPLACE FUNCTION create_user_subscription(
  p_user_id UUID,
  p_plan_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE,
  p_trial_end TIMESTAMP WITH TIME ZONE,
  p_cancel_at_period_end BOOLEAN
) RETURNS JSON AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  INSERT INTO user_subscriptions (
    user_id, plan_id, status, current_period_start, current_period_end, trial_end, cancel_at_period_end
  ) VALUES (
    p_user_id, p_plan_id, p_status, p_current_period_start, p_current_period_end, p_trial_end, p_cancel_at_period_end
  ) RETURNING * INTO subscription_record;
  RETURN row_to_json(subscription_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT * INTO subscription_record
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active' LIMIT 1;
  IF subscription_record IS NULL THEN RETURN NULL; END IF;
  RETURN row_to_json(subscription_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_user_subscription(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_subscriptions
  SET cancel_at_period_end = TRUE, updated_at = TIMEZONE('utc'::text, NOW())
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON public.user_subscriptions(status);

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_subscriptions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_user_subscription TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cancel_user_subscription TO anon, authenticated;

-- Success message
SELECT 'Payment system setup completed successfully!' as status; 