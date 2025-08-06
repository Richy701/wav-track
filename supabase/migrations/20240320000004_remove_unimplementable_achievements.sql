-- Remove achievements that cannot be implemented with current features
-- This migration removes social achievements and problematic time/streak achievements

-- Delete social achievements (collaboration, social links, publishing features not available)
DELETE FROM achievements WHERE id IN ('collab_initiator', 'plugged_in', 'showcase');

-- Delete problematic time achievement (distraction tracking not available)
DELETE FROM achievements WHERE id = 'focused_af';

-- Delete problematic streak achievement (productivity metrics not available)
DELETE FROM achievements WHERE id = 'on_fire';

-- Remove any user_achievements records for these achievements
DELETE FROM user_achievements WHERE achievement_id IN (
  'collab_initiator', 
  'plugged_in', 
  'showcase', 
  'focused_af', 
  'on_fire'
);