-- Drop and recreate the insert_file_with_password function with proper schema reference
CREATE OR REPLACE FUNCTION public.insert_file_with_password(
  p_filename TEXT,
  p_original_name TEXT,
  p_file_size BIGINT,
  p_file_type TEXT,
  p_storage_path TEXT,
  p_share_token TEXT,
  p_share_pin TEXT,
  p_user_id UUID,
  p_password TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  file_id UUID;
  password_hash_value TEXT;
BEGIN
  -- Hash password if provided using pgcrypto from extensions schema
  IF p_password IS NOT NULL THEN
    password_hash_value := extensions.crypt(p_password, extensions.gen_salt('bf'));
  END IF;

  -- Insert file record
  INSERT INTO public.uploaded_files (
    filename,
    original_name,
    file_size,
    file_type,
    storage_path,
    share_token,
    share_pin,
    user_id,
    password_hash
  ) VALUES (
    p_filename,
    p_original_name,
    p_file_size,
    p_file_type,
    p_storage_path,
    p_share_token,
    p_share_pin,
    p_user_id,
    password_hash_value
  )
  RETURNING id INTO file_id;

  RETURN file_id;
END;
$$;

-- Also fix the validate_file_password function to use proper schema reference
CREATE OR REPLACE FUNCTION public.validate_file_password(p_share_pin TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.uploaded_files
  WHERE share_pin = p_share_pin;

  IF stored_hash IS NULL THEN
    RETURN TRUE; -- No password set
  END IF;

  RETURN stored_hash = extensions.crypt(p_password, stored_hash);
END;
$$;