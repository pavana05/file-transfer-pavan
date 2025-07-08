-- Create file collections table for sharing multiple files together
CREATE TABLE public.file_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_name TEXT NOT NULL DEFAULT 'Shared Files',
  share_token TEXT NOT NULL UNIQUE DEFAULT generate_share_token(),
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  download_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  collection_size BIGINT NOT NULL DEFAULT 0
);

-- Enable RLS for file collections
ALTER TABLE public.file_collections ENABLE ROW LEVEL SECURITY;

-- Create policies for file collections
CREATE POLICY "Anyone can insert file collections" 
ON public.file_collections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view file collections" 
ON public.file_collections 
FOR SELECT 
USING (true);

-- Add collection_id to uploaded_files table to link files to collections
ALTER TABLE public.uploaded_files 
ADD COLUMN collection_id UUID REFERENCES public.file_collections(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_uploaded_files_collection_id ON public.uploaded_files(collection_id);
CREATE INDEX idx_file_collections_share_token ON public.file_collections(share_token);

-- Create function to update collection size when files are added/removed
CREATE OR REPLACE FUNCTION public.update_collection_size()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update collection size
CREATE TRIGGER update_collection_size_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.uploaded_files
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_collection_size();