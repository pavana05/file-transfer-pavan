-- Fix existing premium_purchases records that were stored in rupees instead of paise
-- Records with amount_inr < 100 are likely in rupees and need to be converted to paise
UPDATE premium_purchases 
SET amount_inr = amount_inr * 100 
WHERE amount_inr < 100;