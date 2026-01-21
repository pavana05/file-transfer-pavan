-- Drop the old VARCHAR version of the function (with incorrect crypt reference)
DROP FUNCTION IF EXISTS public.validate_file_password(character varying, text);

-- Create a single corrected function that handles both cases
CREATE OR REPLACE FUNCTION public.validate_file_password(p_share_pin text, p_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;