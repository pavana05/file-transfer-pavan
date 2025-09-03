-- Fix security vulnerability: Implement proper access control for file sharing

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Secure file access control" ON public.uploaded_files;
DROP POLICY IF EXISTS "Secure collection access control" ON public.file_collections;

-- Create secure policies for uploaded_files that prevent enumeration
-- but allow access with valid share tokens or PINs
CREATE POLICY "Allow file access with valid credentials" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Allow access only when querying by specific share_token or share_pin
  -- This prevents SELECT * queries without WHERE clauses
  (
    -- Check if the query includes a WHERE clause on share_token
    current_setting('request.path', true) LIKE '%share_token=%'
    OR current_setting('request.path', true) LIKE '%shareToken=%'
  )
  OR
  (
    -- Check if the query includes a WHERE clause on share_pin  
    current_setting('request.path', true) LIKE '%share_pin=%'
    OR current_setting('request.path', true) LIKE '%sharePin=%'
  )
  OR
  (
    -- Allow access when collection_id is specified (for collection files)
    current_setting('request.path', true) LIKE '%collection_id=%'
  )
);

-- Actually, the above approach with request.path won't work reliably
-- Let's use a different approach with security definer functions

-- Drop the previous policy
DROP POLICY IF EXISTS "Allow file access with valid credentials" ON public.uploaded_files;

-- Create a more restrictive policy that requires using our secure functions
-- But first, let's allow the security definer functions to work by temporarily allowing postgres role
CREATE POLICY "Allow file access via secure functions only" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Only allow access via security definer functions (when role is postgres)
  -- or when session has been validated for specific file access
  current_user = 'postgres'
  OR 
  -- Allow access when specific context is set (we'll set this in our functions)
  coalesce(current_setting('app.file_access_token', true), '') != ''
);

-- Create policy for collections with similar restrictions
CREATE POLICY "Allow collection access via secure functions only" 
ON public.file_collections 
FOR SELECT 
USING (
  -- Only allow access via security definer functions
  current_user = 'postgres'
  OR 
  -- Allow access when specific context is set
  coalesce(current_setting('app.collection_access_token', true), '') != ''
);

-- Actually, let's use a simpler and more effective approach
-- Drop the complex policies and use a straightforward token-based approach
DROP POLICY IF EXISTS "Allow file access via secure functions only" ON public.uploaded_files;
DROP POLICY IF EXISTS "Allow collection access via secure functions only" ON public.file_collections;

-- Create application-level access control
-- The key insight: we'll modify our service functions to use RPC calls exclusively

-- Re-enable the security definer approach but make RLS more permissive for the functions
CREATE POLICY "RPC function access only" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Allow access when called from security definer functions
  -- This works because security definer functions run as the function owner (postgres role)
  session_user = 'postgres' 
  OR current_user = 'postgres'
  OR 
  -- Allow access when accessed via service role (for server-side operations)
  current_setting('role') = 'service_role'
);

CREATE POLICY "RPC collection access only" 
ON public.file_collections 
FOR SELECT 
USING (
  -- Same logic for collections
  session_user = 'postgres' 
  OR current_user = 'postgres'
  OR 
  current_setting('role') = 'service_role'
);

-- Keep INSERT, UPDATE policies as they were (they're working fine)
-- The existing INSERT and UPDATE policies should remain unchanged

-- Add comments explaining the security model
COMMENT ON POLICY "RPC function access only" ON public.uploaded_files IS 
'Restricts direct table access. Files should only be accessed via security definer RPC functions that validate share tokens or PINs.';

COMMENT ON POLICY "RPC collection access only" ON public.file_collections IS 
'Restricts direct table access. Collections should only be accessed via security definer RPC functions that validate share tokens.';