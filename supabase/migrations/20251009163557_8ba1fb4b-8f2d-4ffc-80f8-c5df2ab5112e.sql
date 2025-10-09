-- Grant required privileges to allow public (anon) and authenticated clients to execute RPC functions
-- This fixes 'File not found or link has expired' caused by lack of EXECUTE privileges on functions

BEGIN;

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Core RPCs used by the client
GRANT EXECUTE ON FUNCTION public.generate_share_token() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_share_pin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_file_upload(p_filename text, p_file_size bigint, p_file_type text, p_user_id uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_file_by_token(p_share_token text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_file_by_pin(p_share_pin character varying) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_collection_by_token(p_share_token text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_files_by_collection_token(p_collection_token text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_file_download_count(p_share_token text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_collection_download_count(p_share_token text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_file_access(p_share_token text, p_share_pin character varying) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_collection_access(p_share_token text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_file(p_share_token text, p_share_pin character varying, p_collection_id uuid) TO anon, authenticated;

-- User-specific helpers (only authenticated users should call these)
GRANT EXECUTE ON FUNCTION public.get_user_files() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_collections() TO authenticated;

-- Support functions used internally by RPCs (safe to grant execute)
GRANT EXECUTE ON FUNCTION public.check_upload_rate_limit(p_user_id uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_pin_rate_limit(p_ip_address inet, p_share_pin character varying) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_pin_attempt(p_ip_address inet, p_user_id uuid, p_share_pin character varying, p_success boolean) TO anon, authenticated;

COMMIT;