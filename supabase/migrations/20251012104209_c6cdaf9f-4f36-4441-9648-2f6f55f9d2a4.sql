BEGIN;

-- Tighten RLS: require authentication for file uploads
DROP POLICY IF EXISTS "Allow file uploads" ON public.uploaded_files;

CREATE POLICY "Authenticated users can upload files"
ON public.uploaded_files
FOR INSERT
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

COMMIT;