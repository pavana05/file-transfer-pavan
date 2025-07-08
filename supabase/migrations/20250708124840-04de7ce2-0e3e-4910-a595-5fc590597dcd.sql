-- Ensure the uploads bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', true, 104857600, ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Create storage policies to allow file uploads
CREATE POLICY "Allow public file uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public file downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Allow public file updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'uploads');

CREATE POLICY "Allow public file deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'uploads');