-- Add PIN field to uploaded_files table
ALTER TABLE public.uploaded_files 
ADD COLUMN share_pin VARCHAR(4);

-- Create index for faster PIN lookups
CREATE INDEX idx_uploaded_files_share_pin ON public.uploaded_files(share_pin);

-- Function to generate a 4-digit PIN
CREATE OR REPLACE FUNCTION public.generate_share_pin()
RETURNS VARCHAR(4)
LANGUAGE plpgsql
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