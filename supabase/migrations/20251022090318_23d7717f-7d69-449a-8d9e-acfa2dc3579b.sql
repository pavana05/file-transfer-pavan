-- Allow authenticated and anonymous users to upload files to the uploads bucket
CREATE POLICY "Allow file uploads to uploads bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
);