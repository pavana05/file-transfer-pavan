
-- Fix 1: Restrict donations INSERT to service role only (prevents payment bypass)
DROP POLICY IF EXISTS "Anyone can insert donations" ON public.donations;

CREATE POLICY "Service role can insert donations"
ON public.donations
FOR INSERT
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Fix 2: Add DELETE policy for uploaded_files so users can delete their own files
CREATE POLICY "Users can delete their own files"
ON public.uploaded_files
FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix 3: Add global rate limiting for PINs (per-PIN lockout after 20 failed attempts from any source)
CREATE OR REPLACE FUNCTION public.check_pin_rate_limit(p_ip_address inet, p_share_pin character varying)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ip_attempt_count INTEGER;
  global_attempt_count INTEGER;
  max_attempts_per_ip INTEGER := 10;
  max_global_attempts INTEGER := 20;
BEGIN
  -- Clean up old attempts (older than 1 hour)
  DELETE FROM public.pin_attempts 
  WHERE attempt_time < now() - INTERVAL '1 hour';
  
  -- Count recent failed attempts from this IP for this PIN
  SELECT COUNT(*) INTO ip_attempt_count
  FROM public.pin_attempts 
  WHERE ip_address = p_ip_address 
  AND share_pin = p_share_pin
  AND success = false
  AND attempt_time > now() - INTERVAL '1 hour';
  
  -- Check per-IP limit
  IF ip_attempt_count >= max_attempts_per_ip THEN
    RETURN FALSE;
  END IF;
  
  -- Check global per-PIN limit (all IPs combined)
  SELECT COUNT(*) INTO global_attempt_count
  FROM public.pin_attempts 
  WHERE share_pin = p_share_pin
  AND success = false
  AND attempt_time > now() - INTERVAL '1 hour';
  
  IF global_attempt_count >= max_global_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;
