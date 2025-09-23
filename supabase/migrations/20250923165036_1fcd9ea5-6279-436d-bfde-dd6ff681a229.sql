-- Test insert to see if RLS is working correctly for anonymous uploads
-- First, let's check the current RLS policy and make sure anonymous uploads work

-- Create a test file record to verify the system works
DO $$
DECLARE
    test_token TEXT;
    test_pin VARCHAR(4);
BEGIN
    -- Generate test token and pin
    SELECT generate_share_token() INTO test_token;
    SELECT generate_share_pin() INTO test_pin;
    
    -- Try to insert a test record (simulating anonymous upload)
    INSERT INTO uploaded_files (
        filename,
        original_name,
        file_size,
        file_type,
        storage_path,
        share_token,
        share_pin,
        user_id
    ) VALUES (
        test_token || '.png',
        'test-file.png',
        12900,
        'image/png',
        'files/' || test_token || '.png',
        test_token,
        test_pin,
        NULL  -- Anonymous upload
    );
    
    RAISE NOTICE 'Test insert successful with token: %', test_token;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;