-- Insert Trial plan: ₹9 (900 paise), 3 days, 2GB file limit
INSERT INTO public.premium_plans (name, slug, price_inr, file_size_limit, expiration_days, features) VALUES
('Trial', 'trial', 900, 2147483648, 3, '["2GB file limit", "3-day trial access", "Password protection", "Priority support"]'::jsonb);