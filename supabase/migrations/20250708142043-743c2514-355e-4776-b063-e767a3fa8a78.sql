-- Fix the generate_share_token function to use valid PostgreSQL encoding
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Use base64 encoding and make it URL-safe by replacing characters
  RETURN translate(encode(gen_random_bytes(16), 'base64'), '+/', '-_');
END;
$function$