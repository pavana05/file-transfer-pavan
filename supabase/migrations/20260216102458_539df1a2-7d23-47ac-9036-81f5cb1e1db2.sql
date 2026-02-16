
UPDATE premium_plans SET file_size_limit = 21474836480 WHERE slug = 'trial';
UPDATE premium_plans SET file_size_limit = 53687091200 WHERE slug = 'pro';
UPDATE premium_plans SET file_size_limit = 107374182400 WHERE slug = 'business';
