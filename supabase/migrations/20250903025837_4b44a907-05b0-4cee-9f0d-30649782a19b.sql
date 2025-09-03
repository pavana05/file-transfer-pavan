-- Add secure functions for download count updates

CREATE OR REPLACE FUNCTION public.increment_file_download_count(p_share_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current download count and increment it
  UPDATE public.uploaded_files 
  SET download_count = download_count + 1 
  WHERE share_token = p_share_token;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_collection_download_count(p_share_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Get current download count and increment it
  UPDATE public.file_collections 
  SET download_count = download_count + 1 
  WHERE share_token = p_share_token;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add UPDATE policies to allow the secure functions to work
CREATE POLICY "Allow download count updates via secure functions" 
ON public.uploaded_files 
FOR UPDATE 
USING (false)
WITH CHECK (false);

CREATE POLICY "Allow collection download count updates via secure functions" 
ON public.file_collections 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Add comments
COMMENT ON FUNCTION public.increment_file_download_count(TEXT) IS 'Secure function to increment file download count';
COMMENT ON FUNCTION public.increment_collection_download_count(TEXT) IS 'Secure function to increment collection download count';