-- Alternative token generation function that doesn't rely on gen_random_bytes
CREATE OR REPLACE FUNCTION public.generate_share_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use random() function with timestamp to generate unique tokens
  RETURN translate(
    encode(
      decode(
        lpad(
          floor(random() * 16777215)::integer::text, 
          6, 
          '0'
        ) || 
        extract(epoch from now())::bigint::text ||
        lpad(
          floor(random() * 16777215)::integer::text, 
          6, 
          '0'
        ), 
        'escape'
      ), 
      'base64'
    ), 
    '+/', 
    '-_'
  );
END;
$function$