BEGIN;

-- Restore anonymous upload support (app requires this)
DROP POLICY IF EXISTS "Authenticated users can upload files" ON public.uploaded_files;

CREATE POLICY "Allow authenticated and anonymous file uploads"
ON public.uploaded_files
FOR INSERT
WITH CHECK (
  ((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) 
  OR 
  ((auth.uid() IS NULL) AND (user_id IS NULL))
);

COMMIT;