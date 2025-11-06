-- Create file analytics table to track access events
CREATE TABLE public.file_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download')),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_analytics ENABLE ROW LEVEL SECURITY;

-- Allow file owners to view their file analytics
CREATE POLICY "Users can view analytics for their files"
ON public.file_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.uploaded_files
    WHERE uploaded_files.id = file_analytics.file_id
    AND uploaded_files.user_id = auth.uid()
  )
);

-- Service role can insert analytics
CREATE POLICY "Service role can insert analytics"
ON public.file_analytics
FOR INSERT
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Create index for better query performance
CREATE INDEX idx_file_analytics_file_id ON public.file_analytics(file_id);
CREATE INDEX idx_file_analytics_accessed_at ON public.file_analytics(accessed_at DESC);

-- Function to log file access events
CREATE OR REPLACE FUNCTION public.log_file_access(
  p_file_id UUID,
  p_event_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.file_analytics (file_id, event_type, ip_address, user_agent)
  VALUES (p_file_id, p_event_type, p_ip_address, p_user_agent);
END;
$function$;

-- Update get_file_by_token to log views
CREATE OR REPLACE FUNCTION public.get_file_by_token(p_share_token text)
RETURNS TABLE(id uuid, filename text, original_name text, file_size bigint, file_type text, upload_date timestamp with time zone, download_count integer, share_token text, share_pin character varying, user_id uuid, collection_id uuid, storage_path text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  file_record public.uploaded_files%ROWTYPE;
BEGIN
  -- Validate access before returning data
  IF NOT public.validate_file_access(p_share_token, NULL) THEN
    RETURN;
  END IF;
  
  -- Get file record
  SELECT * INTO file_record FROM public.uploaded_files WHERE share_token = p_share_token;
  
  -- Log the view event
  IF FOUND THEN
    PERFORM public.log_file_access(file_record.id, 'view');
  END IF;
  
  -- Update last accessed timestamp
  UPDATE public.uploaded_files 
  SET last_accessed_at = now() 
  WHERE share_token = p_share_token;
  
  -- Return file data
  RETURN QUERY
  SELECT 
    f.id,
    f.filename,
    f.original_name,
    f.file_size,
    f.file_type,
    f.upload_date,
    f.download_count,
    f.share_token,
    f.share_pin,
    f.user_id,
    f.collection_id,
    f.storage_path
  FROM public.uploaded_files f
  WHERE f.share_token = p_share_token;
END;
$function$;