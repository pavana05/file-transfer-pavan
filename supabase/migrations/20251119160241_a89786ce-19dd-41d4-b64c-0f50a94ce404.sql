-- Update validate_file_upload function to allow HTML files
CREATE OR REPLACE FUNCTION public.validate_file_upload(p_filename text, p_file_size bigint, p_file_type text, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  max_file_size BIGINT := 50 * 1024 * 1024; -- 50MB limit
  allowed_types TEXT[] := ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/html', 'application/json',
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
$function$;