-- Create a secure function to get analytics data without exposing sensitive fields
CREATE OR REPLACE FUNCTION public.get_user_file_analytics(
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
RETURNS TABLE (
  event_type text,
  accessed_at timestamp with time zone,
  file_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return analytics for files owned by the authenticated user
  -- Explicitly exclude ip_address and user_agent to protect privacy
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    fa.event_type,
    fa.accessed_at,
    fa.file_id
  FROM public.file_analytics fa
  INNER JOIN public.uploaded_files uf ON fa.file_id = uf.id
  WHERE uf.user_id = auth.uid()
  AND fa.accessed_at >= p_start_date
  AND fa.accessed_at <= p_end_date
  ORDER BY fa.accessed_at DESC;
END;
$$;

-- Drop the existing SELECT policy that exposes sensitive data
DROP POLICY IF EXISTS "Users can view analytics for their files" ON public.file_analytics;

-- Create a more restrictive policy that prevents direct table access
-- Users must use the secure function instead
CREATE POLICY "Restrict direct analytics access" 
ON public.file_analytics 
FOR SELECT 
USING (false);

-- Keep service role INSERT policy for logging
-- (Already exists: "Service role can insert analytics")