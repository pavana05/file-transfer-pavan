-- Update RPC functions to include rate limiting and enhanced security
CREATE OR REPLACE FUNCTION public.get_file_by_pin(p_share_pin character varying)
RETURNS TABLE(id uuid, filename text, original_name text, file_size bigint, file_type text, upload_date timestamp with time zone, download_count integer, share_token text, share_pin character varying, user_id uuid, collection_id uuid, storage_path text)
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
  
  -- Update last accessed timestamp
  UPDATE uploaded_files 
  SET last_accessed_at = now() 
  WHERE share_pin = p_share_pin;
  
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

-- Add file validation function
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  p_filename TEXT,
  p_file_size BIGINT,
  p_file_type TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  max_file_size BIGINT := 50 * 1024 * 1024; -- 50MB limit
  allowed_types TEXT[] := ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/json',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
  ];
BEGIN
  -- Check file size
  IF p_file_size > max_file_size THEN
    RETURN FALSE;
  END IF;
  
  -- Check file type
  IF NOT (p_file_type = ANY(allowed_types)) THEN
    RETURN FALSE;
  END IF;
  
  -- Check filename for security (no path traversal)
  IF p_filename ~ '\.\./|/\.\.|\x00|[<>:"|?*]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check rate limiting for authenticated users
  IF p_user_id IS NOT NULL THEN
    IF NOT public.check_upload_rate_limit(p_user_id) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;