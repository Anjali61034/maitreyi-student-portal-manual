-- Create storage bucket for achievement proofs
insert into storage.buckets (id, name, public)
values ('achievement-proofs', 'achievement-proofs', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Policy: Students can upload files to their own folder
create policy "Students can upload their own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'achievement-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Students can view their own files
create policy "Students can view their own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'achievement-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Students can update their own files
create policy "Students can update their own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'achievement-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Students can delete their own files
create policy "Students can delete their own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'achievement-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Admins can view all files
create policy "Admins can view all files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'achievement-proofs' and
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Policy: Admins can delete any file
create policy "Admins can delete any file"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'achievement-proofs' and
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
