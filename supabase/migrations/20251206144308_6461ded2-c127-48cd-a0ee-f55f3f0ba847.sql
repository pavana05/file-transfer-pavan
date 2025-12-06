-- Add share_pin column to file_collections table for PIN access
ALTER TABLE public.file_collections 
ADD COLUMN share_pin VARCHAR(4) DEFAULT NULL;

-- Create unique index on share_pin for fast lookups
CREATE UNIQUE INDEX idx_file_collections_share_pin ON public.file_collections(share_pin) WHERE share_pin IS NOT NULL;

-- Create function to get collection by PIN
CREATE OR REPLACE FUNCTION public.get_collection_by_pin(p_share_pin VARCHAR)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  created_date TIMESTAMP WITH TIME ZONE,
  download_count INTEGER,
  collection_size BIGINT,
  collection_name TEXT,
  share_token TEXT,
  share_pin VARCHAR,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check rate limiting first
  IF NOT public.check_pin_rate_limit('127.0.0.1'::INET, p_share_pin) THEN
    PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, false);
    RAISE EXCEPTION 'Rate limit exceeded for PIN attempts';
  END IF;
  
  -- Validate access before returning data
  IF NOT EXISTS (
    SELECT 1 FROM public.file_collections c
    WHERE c.share_pin = p_share_pin
    AND c.is_public = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.max_downloads IS NULL OR c.download_count < c.max_downloads)
  ) THEN
    PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, false);
    RETURN;
  END IF;
  
  -- Log successful attempt
  PERFORM public.log_pin_attempt('127.0.0.1'::INET, NULL, p_share_pin, true);
  
  -- Update last accessed timestamp
  UPDATE public.file_collections 
  SET last_accessed_at = now() 
  WHERE public.file_collections.share_pin = p_share_pin;
  
  -- Return collection data
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.created_date,
    c.download_count,
    c.collection_size,
    c.collection_name,
    c.share_token,
    c.share_pin,
    c.description
  FROM public.file_collections c
  WHERE c.share_pin = p_share_pin;
END;
$$;