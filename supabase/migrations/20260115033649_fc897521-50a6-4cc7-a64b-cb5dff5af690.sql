-- Drop duplicate functions to fix the ambiguity error
DROP FUNCTION IF EXISTS public.insert_file_with_password(text, text, bigint, text, text, text, character varying, uuid, text);
DROP FUNCTION IF EXISTS public.insert_file_with_password(text, text, bigint, text, text, text, text, uuid, text);

-- Create a single unified function with text type for share_pin
CREATE OR REPLACE FUNCTION public.insert_file_with_password(
  p_filename text,
  p_original_name text,
  p_file_size bigint,
  p_file_type text,
  p_storage_path text,
  p_share_token text,
  p_share_pin text,
  p_user_id uuid DEFAULT NULL,
  p_password text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_password_hash text;
  v_file_id uuid;
BEGIN
  -- Hash the password if provided using extensions schema
  IF p_password IS NOT NULL AND p_password != '' THEN
    v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));
  END IF;

  -- Insert the file record
  INSERT INTO public.uploaded_files (
    filename,
    original_name,
    file_size,
    file_type,
    storage_path,
    share_token,
    share_pin,
    user_id,
    password_hash
  )
  VALUES (
    p_filename,
    p_original_name,
    p_file_size,
    p_file_type,
    p_storage_path,
    p_share_token,
    p_share_pin,
    p_user_id,
    v_password_hash
  )
  RETURNING id INTO v_file_id;

  RETURN v_file_id;
END;
$$;

-- Create contact_submissions table to store form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  category text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  replied_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access for edge functions
CREATE POLICY "Service role can manage contact submissions"
  ON public.contact_submissions
  FOR ALL
  USING (current_setting('role'::text) = 'service_role'::text)
  WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Allow admins to view all submissions
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update submissions (for status changes, notes)
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_submissions_updated_at();