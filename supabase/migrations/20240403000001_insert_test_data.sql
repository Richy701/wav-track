-- Insert test data
-- Replace the UUID with a valid auth user ID from your Supabase dashboard
insert into public.user_preferences (user_id, theme, notifications_enabled)
values ('00000000-0000-0000-0000-000000000000', 'dark', true);

insert into public.user_metrics (user_id, total_beats, total_sessions)
values ('00000000-0000-0000-0000-000000000000', 0, 0);

insert into public.category_progress (user_id, category, progress_percent)
values ('00000000-0000-0000-0000-000000000000', 'Focus', 0.5); 