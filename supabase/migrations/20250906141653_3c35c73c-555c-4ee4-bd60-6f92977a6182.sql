-- Fix RLS policies to prevent direct table access - Part 1: Drop existing functions

-- Drop existing functions that need to be recreated
DROP FUNCTION IF EXISTS public.get_file_by_token(text);
DROP FUNCTION IF EXISTS public.get_file_by_pin(character varying);
DROP FUNCTION IF EXISTS public.get_collection_by_token(text);

-- Drop all existing SELECT policies for uploaded_files
DROP POLICY IF EXISTS "RPC function access only" ON public.uploaded_files;
DROP POLICY IF EXISTS "Secure file access via token or ownership" ON public.uploaded_files;

-- Drop all existing SELECT policies for file_collections  
DROP POLICY IF EXISTS "RPC collection access only" ON public.file_collections;
DROP POLICY IF EXISTS "Secure collection access via token or ownership" ON public.file_collections;

-- Create a single restrictive policy for uploaded_files that only allows RPC access
CREATE POLICY "RPC only file access" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Only allow access through RPC functions (service role) or file owners
  (current_setting('role') = 'service_role') 
  OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Create a single restrictive policy for file_collections that only allows RPC access
CREATE POLICY "RPC only collection access" 
ON public.file_collections 
FOR SELECT 
USING (
  -- Only allow access through RPC functions (service role) or collection owners
  (current_setting('role') = 'service_role') 
  OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);