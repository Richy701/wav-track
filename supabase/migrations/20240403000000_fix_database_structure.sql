-- Add date column to category_progress
alter table public.category_progress
add column if not exists date date default current_date;

-- Drop & recreate with correct structure
drop table if exists public.user_preferences cascade;
drop table if exists public.user_metrics cascade;
drop table if exists public.category_progress cascade;

-- Rebuild: USER PREFERENCES
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'dark',
  notifications_enabled boolean default true
);

-- Rebuild: USER METRICS
create table public.user_metrics (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_beats int default 0,
  total_sessions int default 0,
  last_active timestamp default now()
);

-- Rebuild: CATEGORY PROGRESS
create table public.category_progress (
  user_id uuid references auth.users(id) on delete cascade,
  category text,
  progress_percent float default 0,
  date date default current_date,
  primary key (user_id, category)
);

-- Enable RLS
alter table public.user_preferences enable row level security;
alter table public.user_metrics enable row level security;
alter table public.category_progress enable row level security;

-- RLS Policies
create policy "Allow user to access own preferences"
on public.user_preferences
for all
using (auth.uid() = user_id);

create policy "Allow user to access own metrics"
on public.user_metrics
for all
using (auth.uid() = user_id);

create policy "Allow user to access own progress"
on public.category_progress
for all
using (auth.uid() = user_id); 