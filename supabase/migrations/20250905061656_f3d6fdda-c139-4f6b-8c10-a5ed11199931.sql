-- Allow anonymous uploads by making user_id nullable
ALTER TABLE public.uploaded_files 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.file_collections 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow anonymous access for INSERT operations
DROP POLICY IF EXISTS "Authenticated users can upload files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Authenticated users can create collections" ON public.file_collections;

-- Create new policies that allow anonymous uploads
CREATE POLICY "Allow file uploads"
ON public.uploaded_files
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow collection creation"
ON public.file_collections
FOR INSERT
WITH CHECK (true);

-- Update existing SELECT policies to allow anonymous access via share tokens
DROP POLICY IF EXISTS "Users can view files via share token" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can view collections via share token" ON public.file_collections;

CREATE POLICY "Allow file access via share token or ownership"
ON public.uploaded_files
FOR SELECT
USING (share_token IS NOT NULL OR (user_id IS NOT NULL AND auth.uid() = user_id));

CREATE POLICY "Allow collection access via share token or ownership"
ON public.file_collections
FOR SELECT
USING (share_token IS NOT NULL OR (user_id IS NOT NULL AND auth.uid() = user_id));