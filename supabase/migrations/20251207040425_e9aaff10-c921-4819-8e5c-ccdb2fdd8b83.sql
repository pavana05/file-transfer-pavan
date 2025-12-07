-- Create premium plans table
CREATE TABLE public.premium_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_inr INTEGER NOT NULL,
  file_size_limit BIGINT NOT NULL,
  expiration_days INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium purchases table
CREATE TABLE public.premium_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.premium_plans(id),
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount_inr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_purchases ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable
CREATE POLICY "Anyone can view active plans"
ON public.premium_plans
FOR SELECT
USING (is_active = true);

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON public.premium_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert/update purchases
CREATE POLICY "Service role can manage purchases"
ON public.premium_purchases
FOR ALL
USING (current_setting('role'::text) = 'service_role')
WITH CHECK (current_setting('role'::text) = 'service_role');

-- Insert default plans
INSERT INTO public.premium_plans (name, slug, price_inr, file_size_limit, expiration_days, features) VALUES
('Pro', 'pro', 49900, 5368709120, 30, '["5GB file limit", "30-day file expiration", "Priority support", "Password protection"]'::jsonb),
('Business', 'business', 199900, 10737418240, NULL, '["10GB file limit", "Unlimited file expiration", "Password protection", "Download analytics", "Priority support", "Custom branding"]'::jsonb);

-- Create function to check user premium status
CREATE OR REPLACE FUNCTION public.get_user_premium_plan(p_user_id UUID)
RETURNS TABLE(plan_name TEXT, file_size_limit BIGINT, expiration_days INTEGER, features JSONB)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.name,
    pp.file_size_limit,
    pp.expiration_days,
    pp.features
  FROM public.premium_purchases pu
  INNER JOIN public.premium_plans pp ON pu.plan_id = pp.id
  WHERE pu.user_id = p_user_id
  AND pu.status = 'completed'
  ORDER BY pp.file_size_limit DESC
  LIMIT 1;
END;
$$;