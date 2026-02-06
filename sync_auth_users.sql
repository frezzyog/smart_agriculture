-- SQL Script to sync Supabase Auth users to public.users table
-- Run this in your Supabase SQL Editor

-- This function will sync all auth.users to public.users
DO $$
DECLARE
    auth_user RECORD;
    synced_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Starting sync of Supabase Auth users to public.users table...';
    RAISE NOTICE '';

    -- Loop through all auth users
    FOR auth_user IN 
        SELECT 
            id,
            email,
            raw_user_meta_data,
            created_at
        FROM auth.users
    LOOP
        -- Check if user already exists in public.users
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
            -- Insert user into public.users
            INSERT INTO public.users (
                id,
                email,
                name,
                phone,
                password,
                role,
                created_at,
                updated_at
            ) VALUES (
                auth_user.id,
                auth_user.email,
                COALESCE(auth_user.raw_user_meta_data->>'name', split_part(auth_user.email, '@', 1)),
                auth_user.raw_user_meta_data->>'phone',
                'SUPABASE_AUTH',
                UPPER(COALESCE(auth_user.raw_user_meta_data->>'role', 'USER'))::"Role",
                auth_user.created_at,
                NOW()
            );
            
            synced_count := synced_count + 1;
            RAISE NOTICE '✅ Synced: % (%)', auth_user.email, auth_user.id;
        ELSE
            skipped_count := skipped_count + 1;
            RAISE NOTICE '⏭️  Skipped: % (already exists)', auth_user.email;
        END IF;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '📊 Sync Summary:';
    RAISE NOTICE '   ✅ Synced: %', synced_count;
    RAISE NOTICE '   ⏭️  Skipped (already exists): %', skipped_count;
    RAISE NOTICE '============================================================';
    
    IF synced_count > 0 THEN
        RAISE NOTICE '🎉 User sync completed successfully!';
    ELSE
        RAISE NOTICE '✨ All users were already synced!';
    END IF;
END $$;
