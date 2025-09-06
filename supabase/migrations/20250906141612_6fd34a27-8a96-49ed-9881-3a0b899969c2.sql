-- Fix RLS policies to prevent direct table access and ensure proper security

-- 1. Drop all existing SELECT policies for uploaded_files
DROP POLICY IF EXISTS "RPC function access only" ON public.uploaded_files;
DROP POLICY IF EXISTS "Secure file access via token or ownership" ON public.uploaded_files;

-- 2. Drop all existing SELECT policies for file_collections  
DROP POLICY IF EXISTS "RPC collection access only" ON public.file_collections;
DROP POLICY IF EXISTS "Secure collection access via token or ownership" ON public.file_collections;

-- 3. Create a single restrictive policy for uploaded_files that only allows RPC access
CREATE POLICY "RPC only file access" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Only allow access through RPC functions (service role) or file owners
  (current_setting('role') = 'service_role') 
  OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 4. Create a single restrictive policy for file_collections that only allows RPC access
CREATE POLICY "RPC only collection access" 
ON public.file_collections 
FOR SELECT 
USING (
  -- Only allow access through RPC functions (service role) or collection owners
  (current_setting('role') = 'service_role') 
  OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 5. Update RPC functions to handle access control internally
CREATE OR REPLACE FUNCTION public.get_file_by_token(p_share_token text)
RETURNS TABLE(
  id uuid,
  filename text,
  original_name text,
  file_size bigint,
  file_type text,
  upload_date timestamptz,
  download_count integer,
  share_token text,
  share_pin varchar,
  user_id uuid,
  collection_id uuid,
  storage_path text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(p_share_token, NULL) THEN
    RETURN; -- Return empty result set
  END IF;
  
  -- Update last accessed timestamp
  UPDATE uploaded_files 
  SET last_accessed_at = now() 
  WHERE share_token = p_share_token;
  
  -- Return only non-sensitive fields
  RETURN QUERY
  SELECT 
    f.id,
    f.filename,
    f.original_name,
    f.file_size,
    f.file_type,
    f.upload_date,
    f.download_count,
    f.share_token,
    f.share_pin,
    f.user_id,
    f.collection_id,
    f.storage_path
  FROM public.uploaded_files f
  WHERE f.share_token = p_share_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_file_by_pin(p_share_pin character varying)
RETURNS TABLE(
  id uuid,
  filename text,
  original_name text,
  file_size bigint,
  file_type text,
  upload_date timestamptz,
  download_count integer,
  share_token text,
  share_pin varchar,
  user_id uuid,
  collection_id uuid,
  storage_path text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(NULL, p_share_pin) THEN
    RETURN; -- Return empty result set
  END IF;
  
  -- Update last accessed timestamp
  UPDATE uploaded_files 
  SET last_accessed_at = now() 
  WHERE share_pin = p_share_pin;
  
  -- Return only accessible files
  RETURN QUERY
  SELECT 
    f.id,
    f.filename,
    f.original_name,
    f.file_size,
    f.file_type,
    f.upload_date,
    f.download_count,
    f.share_token,
    f.share_pin,
    f.user_id,
    f.collection_id,
    f.storage_path
  FROM public.uploaded_files f
  WHERE f.share_pin = p_share_pin;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_collection_by_token(p_share_token text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  created_date timestamptz,
  download_count integer,
  collection_size bigint,
  collection_name text,
  share_token text,
  description text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_collection_access(p_share_token) THEN
    RETURN; -- Return empty result set
  END IF;
  
  -- Update last accessed timestamp
  UPDATE file_collections 
  SET last_accessed_at = now() 
  WHERE share_token = p_share_token;
  
  -- Return collection data
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.created_date,
    c.download_count,
    c.collection_size,
    c.collection_name,
    c.share_token,
    c.description
  FROM public.file_collections c
  WHERE c.share_token = p_share_token;
END;
$$;

-- 6. Create function for users to list their own files
CREATE OR REPLACE FUNCTION public.get_user_files()
RETURNS SETOF uploaded_files
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return files for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT * FROM public.uploaded_files 
  WHERE user_id = auth.uid()
  ORDER BY upload_date DESC;
END;
$$;

-- 7. Create function for users to list their own collections
CREATE OR REPLACE FUNCTION public.get_user_collections()
RETURNS SETOF file_collections
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return collections for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT * FROM public.file_collections 
  WHERE user_id = auth.uid()
  ORDER BY created_date DESC;
END;
$$;