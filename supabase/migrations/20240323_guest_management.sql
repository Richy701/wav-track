-- Enable RLS on all relevant tables
alter table beats enable row level security;
alter table projects enable row level security;
alter table achievements enable row level security;
alter table user_preferences enable row level security;

-- Create RLS policies for beats
create policy "Users can read their own beats"
  on beats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own beats"
  on beats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own beats"
  on beats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own beats"
  on beats for delete
  using (auth.uid() = user_id);

-- Create RLS policies for achievements
create policy "Users can read their own achievements"
  on achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert their own achievements"
  on achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own achievements"
  on achievements for update
  using (auth.uid() = user_id);

create policy "Users can delete their own achievements"
  on achievements for delete
  using (auth.uid() = user_id);

-- Create RLS policies for user_preferences
create policy "Users can read their own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can delete their own preferences"
  on user_preferences for delete
  using (auth.uid() = user_id);

-- Create function to delete guest data
create or replace function public.delete_guest_data(guest_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete all data associated with the guest user
  delete from beats where user_id = guest_user_id;
  delete from projects where user_id = guest_user_id;
  delete from achievements where user_id = guest_user_id;
  delete from user_preferences where user_id = guest_user_id;
  delete from storage.objects where owner = guest_user_id::text;
  
  -- Delete the guest user
  delete from auth.users where id = guest_user_id;
end;
$$; 