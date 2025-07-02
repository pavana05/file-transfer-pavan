-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Create storage policies for file uploads
CREATE POLICY "Anyone can view uploaded files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

CREATE POLICY "Anyone can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploads');

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploads');

-- Create table to track uploaded files metadata
CREATE TABLE public.uploaded_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  download_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on uploaded_files table
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policies for uploaded_files table
CREATE POLICY "Anyone can view file metadata" 
ON public.uploaded_files 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert file metadata" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (true);

-- Create function to generate unique share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Create index for faster lookups
CREATE INDEX idx_uploaded_files_share_token ON public.uploaded_files(share_token);
CREATE INDEX idx_uploaded_files_upload_date ON public.uploaded_files(upload_date DESC);