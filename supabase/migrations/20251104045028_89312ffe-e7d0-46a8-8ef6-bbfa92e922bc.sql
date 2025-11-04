-- Add password protection to uploaded files
ALTER TABLE public.uploaded_files 
ADD COLUMN password_hash TEXT;

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_file_by_pin(VARCHAR);

-- Create function to validate file password
CREATE OR REPLACE FUNCTION public.validate_file_password(
  p_share_pin VARCHAR,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the password hash for this file
  SELECT password_hash INTO stored_hash
  FROM public.uploaded_files
  WHERE share_pin = p_share_pin;
  
  -- If no password is set, return true
  IF stored_hash IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Compare the provided password with stored hash
  RETURN stored_hash = crypt(p_password, stored_hash);
END;
$$;

-- Recreate get_file_by_pin with password support
CREATE OR REPLACE FUNCTION public.get_file_by_pin(p_share_pin VARCHAR)
RETURNS TABLE(
  id UUID,
  filename TEXT,
  original_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE,
  download_count INTEGER,
  share_token TEXT,
  share_pin VARCHAR,
  user_id UUID,
  collection_id UUID,
  storage_path TEXT,
  has_password BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limiting first
  IF NOT public.check_pin_rate_limit('127.0.0.1'::INET, p_share_pin) THEN
    PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, false);
    RAISE EXCEPTION 'Rate limit exceeded for PIN attempts';
  END IF;
  
  -- Validate access before returning data
  IF NOT public.validate_file_access(NULL, p_share_pin) THEN
    PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, false);
    RETURN;
  END IF;
  
  -- Log successful attempt
  PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, true);
  
  -- Update last accessed timestamp
  UPDATE public.uploaded_files 
  SET last_accessed_at = now() 
  WHERE public.uploaded_files.share_pin = p_share_pin;
  
  -- Return file data with password indicator
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
    f.storage_path,
    (f.password_hash IS NOT NULL) as has_password
  FROM public.uploaded_files f
  WHERE f.share_pin = p_share_pin;
END;
$$;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;