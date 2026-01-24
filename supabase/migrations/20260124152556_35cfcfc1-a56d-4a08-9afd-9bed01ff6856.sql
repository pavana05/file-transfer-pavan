-- Create donations table to track all donations
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  amount INTEGER NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own donations" 
ON public.donations 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (current_setting('role'::text) = 'service_role'::text)
);

CREATE POLICY "Admins can view all donations" 
ON public.donations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Service role can update donations" 
ON public.donations 
FOR UPDATE 
USING (current_setting('role'::text) = 'service_role'::text)
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Create index for faster queries
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_created_at ON public.donations(created_at DESC);