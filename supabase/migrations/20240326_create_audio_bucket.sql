-- Create a bucket for audio files if it doesn't exist
insert into storage.buckets (id, name, public)
values ('project-audio', 'project-audio', true)
on conflict do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies for project-audio bucket
create policy "Anyone can read audio files"
on storage.objects for select
using (bucket_id = 'project-audio');

create policy "Authenticated users can upload audio files"
on storage.objects for insert
with check (
  bucket_id = 'project-audio' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own audio files"
on storage.objects for update
using (
  bucket_id = 'project-audio' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own audio files"
on storage.objects for delete
using (
  bucket_id = 'project-audio' and
  auth.uid()::text = (storage.foldername(name))[1]
); 