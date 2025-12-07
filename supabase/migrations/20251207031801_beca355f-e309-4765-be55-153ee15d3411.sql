-- Add proper INSERT policy for authenticated users
CREATE POLICY "Authenticated users can upload to uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Add INSERT policy for anonymous uploads (since app supports anonymous file sharing)
CREATE POLICY "Anonymous users can upload to uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'uploads');