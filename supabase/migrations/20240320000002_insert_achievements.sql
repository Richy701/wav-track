-- Insert Production Achievements
INSERT INTO achievements (id, name, description, icon, tier, category, requirement)
VALUES
  ('first_beat', 'First Beat', 'Create your first beat', '🎵', 'bronze', 'production', 1),
  ('beat_builder', 'Beat Builder', 'Create 10 beats', '🎼', 'gold', 'production', 10),
  ('beat_machine', 'Beat Machine', 'Create 50 beats', '🎹', 'gold', 'production', 50),
  ('legendary_producer', 'Legendary Producer', 'Create 100+ beats', '👑', 'platinum', 'production', 100);

-- Insert Streak Achievements
INSERT INTO achievements (id, name, description, icon, tier, category, requirement)
VALUES
  ('daily_grinder', 'Daily Grinder', 'Log sessions for 7 days straight', '🔥', 'bronze', 'streak', 7),
  ('consistency_king', 'Consistency King', 'Log sessions for 30 days straight', '⚡', 'gold', 'streak', 30),
  ('on_fire', 'On Fire', 'Complete 5 productive sessions in one day', '💫', 'silver', 'streak', 5);

-- Insert Time Investment Achievements
INSERT INTO achievements (id, name, description, icon, tier, category, requirement)
VALUES
  ('studio_rat', 'Studio Rat', 'Log 5 hours of studio time', '🕒', 'bronze', 'time', 5),
  ('time_lord', 'Time Lord', 'Log 20+ hours of creative work', '⏱️', 'gold', 'time', 20),
  ('focused_af', 'Focused AF', 'Complete a 2-hour session without distractions', '🎯', 'silver', 'time', 2);

-- Insert Goal Achievements
INSERT INTO achievements (id, name, description, icon, tier, category, requirement)
VALUES
  ('goal_getter', 'Goal Getter', 'Complete 5 session goals', '✅', 'bronze', 'goals', 5),
  ('finish_what_you_start', 'Finish What You Start', 'Complete 10 projects', '🏁', 'gold', 'goals', 10),
  ('big_vision', 'Big Vision', 'Complete a goal over 60 minutes long', '🚀', 'silver', 'goals', 60);

-- Insert Social Achievements
INSERT INTO achievements (id, name, description, icon, tier, category, requirement)
VALUES
  ('collab_initiator', 'Collab Initiator', 'Invite someone to a session', '🤝', 'bronze', 'social', 1),
  ('plugged_in', 'Plugged In', 'Add all social links to your profile', '🌐', 'silver', 'social', 4),
  ('showcase', 'Showcase', 'Publish a beat preview to your profile', '🎥', 'gold', 'social', 1); 