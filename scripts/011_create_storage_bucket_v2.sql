-- Create storage bucket for achievement proofs
-- This script creates the bucket and sets up RLS policies for file uploads

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('achievement-proofs', 'achievement-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Students can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all files" ON storage.objects;
DROP POLICY IF EXISTS "Students can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any files" ON storage.objects;

-- Policy: Students can upload files to their own folder
CREATE POLICY "Students can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'achievement-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Students can view their own files
CREATE POLICY "Students can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'achievement-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can view all files in the bucket
CREATE POLICY "Admins can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'achievement-proofs'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: Students can delete their own files
CREATE POLICY "Students can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'achievement-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can delete any files
CREATE POLICY "Admins can delete any files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'achievement-proofs'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
