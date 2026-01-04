-- Update premium plan prices
-- Pro plan: ₹49 (4900 paise)
-- Business plan: ₹99 (9900 paise)
UPDATE public.premium_plans 
SET price_inr = 4900 
WHERE slug = 'pro';

UPDATE public.premium_plans 
SET price_inr = 9900 
WHERE slug = 'business';