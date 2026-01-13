-- Grant admin role to pavana25t@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('9935407c-1bec-4425-9529-d96b58f5a12a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;