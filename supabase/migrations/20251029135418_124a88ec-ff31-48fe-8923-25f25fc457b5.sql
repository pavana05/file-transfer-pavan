-- Fix ambiguous column references in RPC functions by qualifying column names

-- 1) get_file_by_token
CREATE OR REPLACE FUNCTION public.get_file_by_token(p_share_token text)
RETURNS TABLE(
  id uuid,
  filename text,
  original_name text,
  file_size bigint,
  file_type text,
  upload_date timestamp with time zone,
  download_count integer,
  share_token text,
  share_pin character varying,
  user_id uuid,
  collection_id uuid,
  storage_path text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(p_share_token, NULL) THEN
    RETURN; -- Return empty result set
  END IF;
  
  -- Update last accessed timestamp (qualified to avoid ambiguity)
  UPDATE public.uploaded_files 
  SET last_accessed_at = now() 
  WHERE public.uploaded_files.share_token = p_share_token;
  
  -- Return file data
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

-- 2) get_file_by_pin (share_pin can also be ambiguous due to OUT parameter)
CREATE OR REPLACE FUNCTION public.get_file_by_pin(p_share_pin character varying)
RETURNS TABLE(
  id uuid,
  filename text,
  original_name text,
  file_size bigint,
  file_type text,
  upload_date timestamp with time zone,
  download_count integer,
  share_token text,
  share_pin character varying,
  user_id uuid,
  collection_id uuid,
  storage_path text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check rate limiting first (simulate IP address for now)
  IF NOT public.check_pin_rate_limit('127.0.0.1'::INET, p_share_pin) THEN
    -- Log the blocked attempt
    PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, false);
    RAISE EXCEPTION 'Rate limit exceeded for PIN attempts';
  END IF;
  
  -- Validate access before returning data
  IF NOT public.validate_file_access(NULL, p_share_pin) THEN
    -- Log the failed attempt
    PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, false);
    RETURN; -- Return empty result set
  END IF;
  
  -- Log successful attempt
  PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, true);
  
  -- Update last accessed timestamp (qualified to avoid ambiguity)
  UPDATE public.uploaded_files 
  SET last_accessed_at = now() 
  WHERE public.uploaded_files.share_pin = p_share_pin;
  
  -- Return file data
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

-- 3) get_collection_by_token (qualify share_token in UPDATE)
CREATE OR REPLACE FUNCTION public.get_collection_by_token(p_share_token text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  created_date timestamp with time zone,
  download_count integer,
  collection_size bigint,
  collection_name text,
  share_token text,
  description text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_collection_access(p_share_token) THEN
    RETURN; -- Return empty result set
  END IF;
  
  -- Update last accessed timestamp (qualified to avoid ambiguity)
  UPDATE public.file_collections 
  SET last_accessed_at = now() 
  WHERE public.file_collections.share_token = p_share_token;
  
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
