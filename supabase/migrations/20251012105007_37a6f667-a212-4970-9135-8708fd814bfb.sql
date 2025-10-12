-- Fix Critical Security Issues

-- 1. Make uploads storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'uploads';

-- 2. Add RLS policies for storage.objects to control upload access
CREATE POLICY "Authenticated users can upload to uploads bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  (auth.uid() IS NOT NULL OR auth.role() = 'service_role')
);

CREATE POLICY "Service role can access uploads bucket files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  auth.role() = 'service_role'
);

-- 3. Tighten pin_attempts RLS policies to service role only
DROP POLICY IF EXISTS "Service role can insert pin attempts" ON pin_attempts;
DROP POLICY IF EXISTS "Service role can update pin attempts" ON pin_attempts;
DROP POLICY IF EXISTS "Service role can delete pin attempts" ON pin_attempts;

CREATE POLICY "Only service role can insert pin attempts"
ON pin_attempts FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Only service role can update pin attempts"
ON pin_attempts FOR UPDATE
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Only service role can delete pin attempts"
ON pin_attempts FOR DELETE
USING (current_setting('role') = 'service_role');