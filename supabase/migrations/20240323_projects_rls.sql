-- Enable RLS
alter table projects enable row level security;

-- Create policies
create policy "Users can read their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Add guest cleanup function
create or replace function public.cleanup_guest_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete expired guest data
  delete from projects
  where user_id in (
    select id from auth.users
    where raw_user_meta_data->>'isGuest' = 'true'
    and (raw_user_meta_data->>'guestExpiresAt')::timestamp < now()
  );
end;
$$; 