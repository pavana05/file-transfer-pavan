-- Fix ambiguous column reference in get_file_by_token function
CREATE OR REPLACE FUNCTION public.get_file_by_token(p_share_token text)
 RETURNS TABLE(id uuid, filename text, original_name text, file_size bigint, file_type text, upload_date timestamp with time zone, download_count integer, share_token text, share_pin character varying, user_id uuid, collection_id uuid, storage_path text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  file_record public.uploaded_files%ROWTYPE;
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(p_share_token, NULL) THEN
    RETURN;
  END IF;
  
  -- Get file record - qualify the column name to avoid ambiguity
  SELECT * INTO file_record FROM public.uploaded_files f WHERE f.share_token = p_share_token;
  
  -- Log the view event
  IF FOUND THEN
    PERFORM public.log_file_access(file_record.id, 'view');
  END IF;
  
  -- Update last accessed timestamp - qualify the column name
  UPDATE public.uploaded_files f
  SET last_accessed_at = now() 
  WHERE f.share_token = p_share_token;
  
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
$function$;