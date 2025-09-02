-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.generate_share_pin()
RETURNS VARCHAR(4)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pin VARCHAR(4);
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate random 4-digit PIN
    pin := LPAD((RANDOM() * 9999)::INTEGER::VARCHAR, 4, '0');
    
    -- Check if PIN already exists
    SELECT COUNT(*) INTO exists_count 
    FROM public.uploaded_files 
    WHERE share_pin = pin;
    
    -- If PIN doesn't exist, return it
    IF exists_count = 0 THEN
      RETURN pin;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use base64 encoding and make it URL-safe by replacing characters
  RETURN translate(encode(gen_random_bytes(16), 'base64'), '+/', '-_');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_collection_size()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
    UPDATE public.file_collections 
    SET collection_size = collection_size + NEW.file_size
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
    UPDATE public.file_collections 
    SET collection_size = collection_size - OLD.file_size
    WHERE id = OLD.collection_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND (NEW.collection_id IS NOT NULL OR OLD.collection_id IS NOT NULL) THEN
    -- Handle collection changes or file size changes
    IF OLD.collection_id IS NOT NULL THEN
      UPDATE public.file_collections 
      SET collection_size = collection_size - OLD.file_size
      WHERE id = OLD.collection_id;
    END IF;
    
    IF NEW.collection_id IS NOT NULL THEN
      UPDATE public.file_collections 
      SET collection_size = collection_size + NEW.file_size
      WHERE id = NEW.collection_id;
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;