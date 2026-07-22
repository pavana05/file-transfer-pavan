
CREATE OR REPLACE FUNCTION public.is_file_downloadable(p_storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.uploaded_files f
    WHERE f.storage_path = p_storage_path
      AND f.is_public = true
      AND (f.expires_at IS NULL OR f.expires_at > now())
      AND (f.max_downloads IS NULL OR f.download_count < f.max_downloads)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_file_downloadable(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_file_downloadable(text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow signed URLs for valid files" ON storage.objects;

CREATE POLICY "Allow signed URLs for valid files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'uploads' AND public.is_file_downloadable(name));
