-- Drop the policy that restricts access too much
DROP POLICY IF EXISTS "Service role can access uploads bucket files" ON storage.objects;

-- Allow signed URL generation for valid public files
CREATE POLICY "Allow signed URLs for valid files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  EXISTS (
    SELECT 1 FROM public.uploaded_files f
    WHERE f.storage_path = storage.objects.name
      AND f.is_public = true
      AND (f.expires_at IS NULL OR f.expires_at > now())
      AND (f.max_downloads IS NULL OR f.download_count < f.max_downloads)
  )
);

-- Allow service role full access
CREATE POLICY "Service role full access to uploads"
ON storage.objects FOR ALL
USING (
  bucket_id = 'uploads' AND
  auth.role() = 'service_role'
);
