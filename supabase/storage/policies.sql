-- Create a bucket for user files if it doesn't exist
insert into storage.buckets (id, name)
values ('user_files', 'user_files')
on conflict do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies for user_files bucket
create policy "Users can read their own files"
on storage.objects for select
using (
  bucket_id = 'user_files' and
  auth.uid() = owner
);

create policy "Users can upload their own files"
on storage.objects for insert
with check (
  bucket_id = 'user_files' and
  auth.uid() = owner
);

create policy "Users can update their own files"
on storage.objects for update
using (
  bucket_id = 'user_files' and
  auth.uid() = owner
);

create policy "Users can delete their own files"
on storage.objects for delete
using (
  bucket_id = 'user_files' and
  auth.uid() = owner
);

-- Add guest cleanup policy for storage
create policy "Automatically remove expired guest files"
on storage.objects for delete
using (
  exists (
    select 1 from auth.users
    where id = owner
    and raw_user_meta_data->>'isGuest' = 'true'
    and (raw_user_meta_data->>'guestExpiresAt')::timestamp < now()
  )
); 