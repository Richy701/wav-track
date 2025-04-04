-- Add foreign key constraint between sessions and session_goals
alter table public.sessions
add constraint fk_active_goal
foreign key (active_goal_id)
references public.session_goals(id)
on delete set null; 