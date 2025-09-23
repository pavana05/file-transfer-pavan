-- Add unique constraint on user_id to support ON CONFLICT operations
-- This ensures each user can only have one rate limit record
ALTER TABLE public.upload_rate_limits 
ADD CONSTRAINT upload_rate_limits_user_id_unique UNIQUE (user_id);