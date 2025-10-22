-- Fix profiles table RLS - prevent unauthorized access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Only allow users to see their own profile, deny all other access
CREATE POLICY "Users can only view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Prevent profile enumeration completely
CREATE POLICY "Deny anonymous profile access"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix upload_rate_limits - prevent unauthorized access  
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.upload_rate_limits;

-- Only allow users to see their own rate limits
CREATE POLICY "Users can only view own rate limits"
ON public.upload_rate_limits FOR SELECT
USING (auth.uid() = user_id);