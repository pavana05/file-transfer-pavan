-- Phase 1: Upload Security Hardening
-- 1. Restrict file upload permissions to require authentication
DROP POLICY IF EXISTS "Allow file uploads" ON public.uploaded_files;
DROP POLICY IF EXISTS "Allow collection creation" ON public.file_collections;

CREATE POLICY "Authenticated users can upload files" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "Authenticated users can create collections" 
ON public.file_collections 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- 2. Restrict download count updates to RPC functions only
DROP POLICY IF EXISTS "Allow download count updates" ON public.uploaded_files;
DROP POLICY IF EXISTS "Allow collection download count updates" ON public.file_collections;

CREATE POLICY "Service role can update download counts" 
ON public.uploaded_files 
FOR UPDATE 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role can update collection download counts" 
ON public.file_collections 
FOR UPDATE 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 3. Add rate limiting tables and functions
CREATE TABLE IF NOT EXISTS public.upload_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  uploads_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pin_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET,
  user_id UUID,
  share_pin VARCHAR(4) NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS on rate limiting tables
ALTER TABLE public.upload_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate limiting tables
CREATE POLICY "Users can view their own rate limits" 
ON public.upload_rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rate limits" 
ON public.upload_rate_limits 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role can manage pin attempts" 
ON public.pin_attempts 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 4. Rate limiting functions
CREATE OR REPLACE FUNCTION public.check_upload_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_uploads_per_hour INTEGER := 50; -- Configurable limit
BEGIN
  -- Clean up old entries (older than 1 hour)
  DELETE FROM public.upload_rate_limits 
  WHERE window_start < now() - INTERVAL '1 hour';
  
  -- Get current upload count in the last hour
  SELECT COALESCE(SUM(uploads_count), 0) INTO current_count
  FROM public.upload_rate_limits 
  WHERE user_id = p_user_id 
  AND window_start > now() - INTERVAL '1 hour';
  
  -- Check if limit exceeded
  IF current_count >= max_uploads_per_hour THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO public.upload_rate_limits (user_id, uploads_count, window_start)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE 
  SET uploads_count = upload_rate_limits.uploads_count + 1,
      window_start = CASE 
        WHEN upload_rate_limits.window_start < now() - INTERVAL '1 hour' 
        THEN now() 
        ELSE upload_rate_limits.window_start 
      END;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_pin_rate_limit(p_ip_address INET, p_share_pin VARCHAR(4))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
  max_attempts_per_hour INTEGER := 10; -- Configurable limit
BEGIN
  -- Clean up old attempts (older than 1 hour)
  DELETE FROM public.pin_attempts 
  WHERE attempt_time < now() - INTERVAL '1 hour';
  
  -- Count recent failed attempts from this IP for this PIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.pin_attempts 
  WHERE ip_address = p_ip_address 
  AND share_pin = p_share_pin
  AND success = false
  AND attempt_time > now() - INTERVAL '1 hour';
  
  -- Check if limit exceeded
  IF attempt_count >= max_attempts_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_pin_attempt(
  p_ip_address INET, 
  p_user_id UUID, 
  p_share_pin VARCHAR(4), 
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pin_attempts (ip_address, user_id, share_pin, success)
  VALUES (p_ip_address, p_user_id, p_share_pin, p_success);
END;
$$;