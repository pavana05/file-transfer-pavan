-- Add show_on_wall column to donations table for public supporters wall
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS show_on_wall boolean DEFAULT false;

-- Add an index for faster queries when showing the wall
CREATE INDEX IF NOT EXISTS idx_donations_show_on_wall 
ON public.donations (show_on_wall, completed_at DESC) 
WHERE show_on_wall = true AND status = 'completed';

-- Create RLS policy for public reading of wall donations
CREATE POLICY "Anyone can view donations shown on wall" 
ON public.donations 
FOR SELECT 
USING (show_on_wall = true AND status = 'completed');