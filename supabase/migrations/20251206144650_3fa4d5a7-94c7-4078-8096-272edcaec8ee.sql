-- Drop the existing restrictive INSERT policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can create collections" ON public.file_collections;

CREATE POLICY "Anyone can create collections" 
ON public.file_collections 
FOR INSERT 
WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));