-- Implement proper security: Replace permissive policies with context-based access control

-- Drop the current permissive policy
DROP POLICY IF EXISTS "Secure file access control" ON public.uploaded_files;
DROP POLICY IF EXISTS "Secure collection access via share token" ON public.file_collections;

-- Create security definer functions for controlled access
CREATE OR REPLACE FUNCTION public.get_file_by_token(p_share_token TEXT)
RETURNS SETOF public.uploaded_files AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.uploaded_files 
  WHERE share_token = p_share_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_file_by_pin(p_share_pin VARCHAR)
RETURNS SETOF public.uploaded_files AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.uploaded_files 
  WHERE share_pin = p_share_pin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_files_by_collection_token(p_collection_token TEXT)
RETURNS SETOF public.uploaded_files AS $$
DECLARE
  collection_record public.file_collections%ROWTYPE;
BEGIN
  -- First verify the collection exists and get its ID
  SELECT * INTO collection_record 
  FROM public.file_collections 
  WHERE share_token = p_collection_token;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Return files in the collection
  RETURN QUERY
  SELECT * FROM public.uploaded_files 
  WHERE collection_id = collection_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_collection_by_token(p_share_token TEXT)
RETURNS SETOF public.file_collections AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.file_collections 
  WHERE share_token = p_share_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create restrictive RLS policies that deny direct table access
CREATE POLICY "Deny direct file access" 
ON public.uploaded_files 
FOR SELECT 
USING (false);

CREATE POLICY "Deny direct collection access" 
ON public.file_collections 
FOR SELECT 
USING (false);

-- Add comments explaining the security model
COMMENT ON FUNCTION public.get_file_by_token(TEXT) IS 'Secure function to access files by share token';
COMMENT ON FUNCTION public.get_file_by_pin(VARCHAR) IS 'Secure function to access files by PIN';
COMMENT ON FUNCTION public.get_files_by_collection_token(TEXT) IS 'Secure function to access files in a collection';
COMMENT ON FUNCTION public.get_collection_by_token(TEXT) IS 'Secure function to access collections by token';

COMMENT ON POLICY "Deny direct file access" ON public.uploaded_files IS 
'Direct access to uploaded_files table is denied. Use security definer functions instead.';

COMMENT ON POLICY "Deny direct collection access" ON public.file_collections IS 
'Direct access to file_collections table is denied. Use security definer functions instead.';