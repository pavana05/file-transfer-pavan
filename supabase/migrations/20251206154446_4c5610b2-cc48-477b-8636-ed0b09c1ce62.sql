-- Create a secure function to insert collections for both anonymous and authenticated users
CREATE OR REPLACE FUNCTION public.insert_collection(
  p_collection_name text,
  p_description text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_share_pin varchar DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  collection_name text,
  description text,
  user_id uuid,
  share_token text,
  share_pin varchar,
  created_date timestamp with time zone,
  download_count integer,
  collection_size bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  new_share_token text;
BEGIN
  -- Generate share token
  new_share_token := public.generate_share_token();
  
  -- Insert the collection
  INSERT INTO public.file_collections (
    collection_name,
    description,
    user_id,
    share_token,
    share_pin
  ) VALUES (
    p_collection_name,
    p_description,
    p_user_id,
    new_share_token,
    p_share_pin
  )
  RETURNING file_collections.id INTO new_id;
  
  -- Return the created collection
  RETURN QUERY
  SELECT 
    fc.id,
    fc.collection_name,
    fc.description,
    fc.user_id,
    fc.share_token,
    fc.share_pin,
    fc.created_date,
    fc.download_count,
    fc.collection_size
  FROM public.file_collections fc
  WHERE fc.id = new_id;
END;
$$;