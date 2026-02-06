-- Quick fix: Sync the specific user that's causing the expense error
-- Run this in Supabase SQL Editor

-- This will add the missing user e2f254c2-5389-4d07-b037-2c7a3ab477b5
INSERT INTO public.users (id, email, name, phone, password, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    au.raw_user_meta_data->>'phone' as phone,
    'SUPABASE_AUTH' as password,
    UPPER(COALESCE(au.raw_user_meta_data->>'role', 'USER'))::"Role" as role,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.id = 'e2f254c2-5389-4d07-b037-2c7a3ab477b5'
ON CONFLICT (id) DO NOTHING;

-- Verify the user was added
SELECT 
    'User synced successfully!' as status,
    id, 
    email, 
    name, 
    role 
FROM public.users 
WHERE id = 'e2f254c2-5389-4d07-b037-2c7a3ab477b5';
