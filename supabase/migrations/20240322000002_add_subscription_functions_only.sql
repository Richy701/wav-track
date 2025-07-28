-- Create functions for subscription management (standalone)

-- Function to create a user subscription
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

-- Function to get user subscription
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

-- Function to cancel user subscription
CREATE OR REPLACE FUNCTION cancel_user_subscription(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_subscriptions
  SET cancel_at_period_end = TRUE, updated_at = TIMEZONE('utc'::text, NOW())
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 