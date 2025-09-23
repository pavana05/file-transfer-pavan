-- Update RLS policy to allow both authenticated and anonymous uploads
DROP POLICY IF EXISTS "Authenticated users can upload files" ON public.uploaded_files;

CREATE POLICY "Allow file uploads" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to upload files with their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Allow anonymous uploads with null user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);