-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create collections" ON public.file_collections;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON public.uploaded_files;

-- Create new policies that allow both authenticated and anonymous inserts

-- Allow anyone to create collections (user_id can be null for anonymous)
CREATE POLICY "Anyone can create collections"
ON public.file_collections
FOR INSERT
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
);

-- Allow anyone to upload files (user_id can be null for anonymous)
CREATE POLICY "Anyone can upload files"
ON public.uploaded_files
FOR INSERT
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
);