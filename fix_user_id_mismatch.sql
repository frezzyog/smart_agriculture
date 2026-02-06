-- Fix user ID mismatch between auth.users and public.users
-- This handles the case where the email exists but with a different ID
-- Run this in Supabase SQL Editor

-- Step 1: Check the current situation
DO $$
DECLARE
    auth_id TEXT;
    public_id TEXT;
    user_email TEXT := 'rothadalin8@gmail.com';
BEGIN
    -- Get the ID from auth.users
    SELECT id INTO auth_id FROM auth.users WHERE email = user_email;
    
    -- Get the ID from public.users
    SELECT id INTO public_id FROM public.users WHERE email = user_email;
    
    RAISE NOTICE '🔍 User: %', user_email;
    RAISE NOTICE '   Auth ID: %', auth_id;
    RAISE NOTICE '   Public ID: %', public_id;
    RAISE NOTICE '';
    
    IF auth_id IS NULL THEN
        RAISE NOTICE '❌ User not found in auth.users';
    ELSIF public_id IS NULL THEN
        RAISE NOTICE '⚠️  User not found in public.users';
    ELSIF auth_id != public_id THEN
        RAISE NOTICE '⚠️  ID MISMATCH! This will be fixed.';
    ELSE
        RAISE NOTICE '✅ IDs match - no action needed';
    END IF;
END $$;

-- Step 2: Fix the mismatch by updating related records and then the user ID
DO $$
DECLARE
    auth_id TEXT;
    old_public_id TEXT;
    user_email TEXT := 'rothadalin8@gmail.com';
    affected_expenses INTEGER;
BEGIN
    -- Get IDs
    SELECT id INTO auth_id FROM auth.users WHERE email = user_email;
    SELECT id INTO old_public_id FROM public.users WHERE email = user_email;
    
    -- Only proceed if there's a mismatch
    IF auth_id IS NOT NULL AND old_public_id IS NOT NULL AND auth_id != old_public_id THEN
        RAISE NOTICE '🔧 Fixing ID mismatch for %...', user_email;
        RAISE NOTICE '';
        
        -- Update expenses to point to the new user ID
        UPDATE public.expenses 
        SET user_id = auth_id 
        WHERE user_id = old_public_id;
        
        GET DIAGNOSTICS affected_expenses = ROW_COUNT;
        RAISE NOTICE '✅ Updated % expenses to new user ID', affected_expenses;
        
        -- Update devices if any
        UPDATE public.devices 
        SET "user_id" = auth_id 
        WHERE "user_id" = old_public_id;
        
        -- Update zones if any
        UPDATE public.zones 
        SET "user_id" = auth_id 
        WHERE "user_id" = old_public_id;
        
        -- Now update the user record itself
        UPDATE public.users 
        SET id = auth_id 
        WHERE id = old_public_id;
        
        RAISE NOTICE '✅ Updated user ID from % to %', old_public_id, auth_id;
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Fix completed successfully!';
    ELSE
        RAISE NOTICE 'ℹ️  No fix needed';
    END IF;
END $$;

-- Step 3: Verify the fix
SELECT 
    '✅ Verification' as status,
    u.id,
    u.email,
    u.name,
    u.role,
    COUNT(e.id) as expense_count
FROM public.users u
LEFT JOIN public.expenses e ON e.user_id = u.id
WHERE u.email = 'rothadalin8@gmail.com'
GROUP BY u.id, u.email, u.name, u.role;
