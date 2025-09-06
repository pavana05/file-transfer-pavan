-- Fix security issues with file sharing

-- 1. Add expiration dates and access control to uploaded_files
ALTER TABLE public.uploaded_files 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_downloads INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Add expiration dates and access control to file_collections  
ALTER TABLE public.file_collections
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_downloads INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Create secure access validation function
CREATE OR REPLACE FUNCTION public.validate_file_access(
  p_share_token TEXT DEFAULT NULL,
  p_share_pin VARCHAR DEFAULT NULL
) RETURNS BOOLEAN 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  file_record uploaded_files%ROWTYPE;
BEGIN
  -- Get file by token or PIN
  IF p_share_token IS NOT NULL THEN
    SELECT * INTO file_record FROM uploaded_files WHERE share_token = p_share_token;
  ELSIF p_share_pin IS NOT NULL THEN
    SELECT * INTO file_record FROM uploaded_files WHERE share_pin = p_share_pin;
  ELSE
    RETURN FALSE;
  END IF;
  
  -- Check if file exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if file is public
  IF NOT file_record.is_public THEN
    RETURN FALSE;
  END IF;
  
  -- Check expiration
  IF file_record.expires_at IS NOT NULL AND file_record.expires_at < now() THEN
    RETURN FALSE;
  END IF;
  
  -- Check max downloads limit
  IF file_record.max_downloads IS NOT NULL AND file_record.download_count >= file_record.max_downloads THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 4. Create secure collection access validation function
CREATE OR REPLACE FUNCTION public.validate_collection_access(p_share_token TEXT) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  collection_record file_collections%ROWTYPE;
BEGIN
  SELECT * INTO collection_record FROM file_collections WHERE share_token = p_share_token;
  
  -- Check if collection exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if collection is public
  IF NOT collection_record.is_public THEN
    RETURN FALSE;
  END IF;
  
  -- Check expiration
  IF collection_record.expires_at IS NOT NULL AND collection_record.expires_at < now() THEN
    RETURN FALSE;
  END IF;
  
  -- Check max downloads limit
  IF collection_record.max_downloads IS NOT NULL AND collection_record.download_count >= collection_record.max_downloads THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 5. Update RLS policies for uploaded_files with proper security
DROP POLICY IF EXISTS "Allow file access via share token or ownership" ON public.uploaded_files;

CREATE POLICY "Secure file access via token or ownership" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Allow access if user owns the file
  (user_id IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Allow access via valid share token with security checks
  (share_token IS NOT NULL AND public.validate_file_access(share_token, NULL))
);

-- 6. Update RLS policies for file_collections with proper security
DROP POLICY IF EXISTS "Allow collection access via share token or ownership" ON public.file_collections;

CREATE POLICY "Secure collection access via token or ownership" 
ON public.file_collections 
FOR SELECT 
USING (
  -- Allow access if user owns the collection
  (user_id IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Allow access via valid share token with security checks
  (share_token IS NOT NULL AND public.validate_collection_access(share_token))
);

-- 7. Update existing RPC functions to use security validation
CREATE OR REPLACE FUNCTION public.get_file_by_token(p_share_token text)
RETURNS SETOF uploaded_files
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(p_share_token, NULL) THEN
    RETURN;
  END IF;
  
  -- Update last accessed timestamp
  UPDATE uploaded_files 
  SET last_accessed_at = now() 
  WHERE share_token = p_share_token;
  
  RETURN QUERY
  SELECT * FROM public.uploaded_files 
  WHERE share_token = p_share_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_file_by_pin(p_share_pin character varying)
RETURNS SETOF uploaded_files
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(NULL, p_share_pin) THEN
    RETURN;
  END IF;
  
  -- Update last accessed timestamp
  UPDATE uploaded_files 
  SET last_accessed_at = now() 
  WHERE share_pin = p_share_pin;
  
  RETURN QUERY
  SELECT * FROM public.uploaded_files 
  WHERE share_pin = p_share_pin;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_collection_by_token(p_share_token text)
RETURNS SETOF file_collections
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_collection_access(p_share_token) THEN
    RETURN;
  END IF;
  
  -- Update last accessed timestamp
  UPDATE file_collections 
  SET last_accessed_at = now() 
  WHERE share_token = p_share_token;
  
  RETURN QUERY
  SELECT * FROM public.file_collections 
  WHERE share_token = p_share_token;
END;
$$;

-- 8. Create function to revoke file access
CREATE OR REPLACE FUNCTION public.revoke_file_access(p_share_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE uploaded_files 
  SET is_public = false, expires_at = now()
  WHERE share_token = p_share_token 
  AND (user_id IS NULL OR user_id = auth.uid());
  
  RETURN FOUND;
END;
$$;

-- 9. Create function to revoke collection access
CREATE OR REPLACE FUNCTION public.revoke_collection_access(p_share_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE file_collections 
  SET is_public = false, expires_at = now()
  WHERE share_token = p_share_token 
  AND (user_id IS NULL OR user_id = auth.uid());
  
  RETURN FOUND;
END;
$$;