# Supabase Storage Setup Instructions

Since storage buckets cannot be created via SQL scripts in this environment, you need to manually create the storage bucket in your Supabase dashboard.

## Steps to Create the Storage Bucket

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Create the Storage Bucket**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Bucket name: `achievement-proofs`
   - Set as **Public bucket**: ✅ Yes (check this box)
   - Click "Create bucket"

3. **Set Up Storage Policies**
   - After creating the bucket, click on it
   - Go to the "Policies" tab
   - Click "New Policy"

   **Policy 1: Students can upload their own files**
   - Policy name: `Students can upload own files`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - USING expression:
   \`\`\`sql
   (bucket_id = 'achievement-proofs' AND (storage.foldername(name))[1] = auth.uid()::text)
   \`\`\`

   **Policy 2: Students can view their own files**
   - Policy name: `Students can view own files`
   - Allowed operation: `SELECT`
   - Target roles: `authenticated`
   - USING expression:
   \`\`\`sql
   (bucket_id = 'achievement-proofs' AND ((storage.foldername(name))[1] = auth.uid()::text OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'))
   \`\`\`

   **Policy 3: Students can delete their own files**
   - Policy name: `Students can delete own files`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression:
   \`\`\`sql
   (bucket_id = 'achievement-proofs' AND (storage.foldername(name))[1] = auth.uid()::text)
   \`\`\`

   **Policy 4: Admins can view all files**
   - Policy name: `Admins can view all files`
   - Allowed operation: `SELECT`
   - Target roles: `authenticated`
   - USING expression:
   \`\`\`sql
   (bucket_id = 'achievement-proofs' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
   \`\`\`

4. **Verify Setup**
   - Go back to your app and try uploading a file
   - The upload should now work!

## Alternative: Simplified Policy Setup

If the above policies are too complex, you can use these simpler policies:

**Simple Policy 1: Authenticated users can upload**
\`\`\`sql
bucket_id = 'achievement-proofs' AND auth.role() = 'authenticated'
\`\`\`

**Simple Policy 2: Authenticated users can view**
\`\`\`sql
bucket_id = 'achievement-proofs' AND auth.role() = 'authenticated'
\`\`\`

**Simple Policy 3: Authenticated users can delete**
\`\`\`sql
bucket_id = 'achievement-proofs' AND auth.role() = 'authenticated'
\`\`\`

These simpler policies allow all authenticated users to upload, view, and delete files. You can refine them later for better security.
