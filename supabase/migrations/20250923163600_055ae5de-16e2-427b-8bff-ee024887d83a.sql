-- Enable RLS on pin_attempts table (if not already enabled)
ALTER TABLE public.pin_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy to recreate with more specific permissions
DROP POLICY IF EXISTS "Service role can manage pin attempts" ON public.pin_attempts;

-- Create granular policies for maximum security

-- Policy 1: Only service role can insert new pin attempts (for logging)
CREATE POLICY "Service role can insert pin attempts" 
ON public.pin_attempts 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Policy 2: Only service role can update pin attempts (for maintenance)
CREATE POLICY "Service role can update pin attempts" 
ON public.pin_attempts 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Only service role can delete pin attempts (for cleanup)
CREATE POLICY "Service role can delete pin attempts" 
ON public.pin_attempts 
FOR DELETE 
TO service_role
USING (true);

-- Policy 4: No SELECT access for public - completely restrict reading
-- This ensures no one can view IP addresses or failed login patterns
CREATE POLICY "Restrict all public access to pin attempts" 
ON public.pin_attempts 
FOR SELECT 
TO public
USING (false);

-- Policy 5: Service role can select for analysis/monitoring only
CREATE POLICY "Service role can select pin attempts" 
ON public.pin_attempts 
FOR SELECT 
TO service_role
USING (true);