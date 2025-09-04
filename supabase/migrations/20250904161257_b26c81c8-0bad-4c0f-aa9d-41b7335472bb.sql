-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add user_id column to uploaded_files
ALTER TABLE public.uploaded_files 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to file_collections  
ALTER TABLE public.file_collections
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for uploaded_files to require authentication
DROP POLICY IF EXISTS "Allow file uploads" ON public.uploaded_files;
DROP POLICY IF EXISTS "Anyone can insert file metadata" ON public.uploaded_files;

CREATE POLICY "Authenticated users can upload files" 
ON public.uploaded_files 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view files via share token" 
ON public.uploaded_files 
FOR SELECT 
USING (
  -- Allow access via share token (public sharing)
  share_token IS NOT NULL
  -- Or if user owns the file
  OR auth.uid() = user_id
);

-- Update RLS policies for file_collections to require authentication
DROP POLICY IF EXISTS "Allow collection creation" ON public.file_collections;
DROP POLICY IF EXISTS "Anyone can insert file collections" ON public.file_collections;

CREATE POLICY "Authenticated users can create collections" 
ON public.file_collections 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view collections via share token" 
ON public.file_collections 
FOR SELECT 
USING (
  -- Allow access via share token (public sharing)
  share_token IS NOT NULL
  -- Or if user owns the collection
  OR auth.uid() = user_id
);

-- Update existing records to have a placeholder user_id (optional - you may want to delete existing data instead)
-- Note: This is just to prevent existing data from breaking. In production, you'd likely want to clean up existing anonymous uploads.
UPDATE public.uploaded_files SET user_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE user_id IS NULL;
UPDATE public.file_collections SET user_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE public.uploaded_files ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.file_collections ALTER COLUMN user_id SET NOT NULL;