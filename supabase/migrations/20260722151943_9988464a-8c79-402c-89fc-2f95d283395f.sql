
-- 1. Donations: remove public row access, expose safe columns via view
DROP POLICY IF EXISTS "Anyone can view donations shown on wall" ON public.donations;

CREATE OR REPLACE VIEW public.donation_wall
WITH (security_invoker = true) AS
SELECT id, name, amount, message, completed_at, created_at, show_on_wall, status
FROM public.donations
WHERE show_on_wall = true AND status = 'completed';

GRANT SELECT ON public.donation_wall TO anon, authenticated;

-- 2. Storage: uploads bucket - ownership-checked update/delete
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

CREATE POLICY "Owners can delete uploaded files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND EXISTS (
    SELECT 1 FROM public.uploaded_files uf
    WHERE uf.storage_path = storage.objects.name
      AND uf.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update uploaded files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND EXISTS (
    SELECT 1 FROM public.uploaded_files uf
    WHERE uf.storage_path = storage.objects.name
      AND uf.user_id = auth.uid()
  )
);

-- 3. Storage: avatars bucket - restrict listing to own folder (public URLs still work since bucket is public)
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own avatars" ON storage.objects;

CREATE POLICY "Users can list own avatar folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Revoke EXECUTE on internal helper SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.check_pin_rate_limit(inet, character varying) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_pin_attempt(inet, uuid, character varying, boolean) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_file_access(uuid, text, inet, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_upload_rate_limit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_file_upload(text, bigint, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_file_access(text, character varying) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_collection_access(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_file(text, character varying, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_share_token() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_share_pin() FROM PUBLIC, anon, authenticated;
