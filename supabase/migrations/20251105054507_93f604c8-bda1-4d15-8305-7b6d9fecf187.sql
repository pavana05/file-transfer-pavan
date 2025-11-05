-- Create function to insert file with password hashing
CREATE OR REPLACE FUNCTION public.insert_file_with_password(
  p_filename TEXT,
  p_original_name TEXT,
  p_file_size BIGINT,
  p_file_type TEXT,
  p_storage_path TEXT,
  p_share_token TEXT,
  p_share_pin VARCHAR,
  p_user_id UUID,
  p_password TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  file_id UUID;
  password_hash_value TEXT;
BEGIN
  -- Hash password if provided
  IF p_password IS NOT NULL THEN
    password_hash_value := crypt(p_password, gen_salt('bf'));
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