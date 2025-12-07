-- Remove all overly permissive storage policies
DROP POLICY IF EXISTS "Allow public file deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Allow file uploads to uploads bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to uploads bucket" ON storage.objects;

-- Keep only:
-- - "Allow signed URLs for valid files" (SELECT for signed URL access)
-- - "Service role full access to uploads" (for backend operations)
-- - "Users can update their own files" (already exists)
-- - "Users can delete their own files" (already exists)