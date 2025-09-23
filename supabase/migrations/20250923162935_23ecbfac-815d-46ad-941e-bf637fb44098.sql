-- Enable pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Alternative: Update the generate_share_token function to use a different approach if needed
-- But first try with the extension enabled