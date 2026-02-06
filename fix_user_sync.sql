-- SQL Script to fix user sync issues between auth.users and public.users
-- This handles duplicate emails and missing users
-- Run this in your Supabase SQL Editor

-- Step 1: First, let's see what the current situation is
DO $$
DECLARE
    auth_count INTEGER;
    public_count INTEGER;
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO public_count FROM public.users;
    
    SELECT COUNT(*) INTO missing_count 
    FROM auth.users au 
    WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);
    
    RAISE NOTICE '📊 Current Status:';
    RAISE NOTICE '   Auth users: %', auth_count;
    RAISE NOTICE '   Public users: %', public_count;
    RAISE NOTICE '   Missing in public.users: %', missing_count;
    RAISE NOTICE '';
END $$;

-- Step 2: Sync missing users (using UPSERT to handle conflicts)
DO $$
DECLARE
    auth_user RECORD;
    synced_count INTEGER := 0;
    skipped_count INTEGER := 0;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Starting sync...';
    RAISE NOTICE '';

    FOR auth_user IN 
        SELECT 
            id,
            email,
            raw_user_meta_data,
            created_at
        FROM auth.users
    LOOP
        -- Use INSERT ... ON CONFLICT to handle both new and existing users
        BEGIN
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
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = COALESCE(EXCLUDED.name, public.users.name),
                phone = COALESCE(EXCLUDED.phone, public.users.phone),
                updated_at = NOW();
            
            IF NOT FOUND THEN
                updated_count := updated_count + 1;
                RAISE NOTICE '🔄 Updated: % (%)', auth_user.email, auth_user.id;
            ELSE
                synced_count := synced_count + 1;
                RAISE NOTICE '✅ Synced: % (%)', auth_user.email, auth_user.id;
            END IF;
            
        EXCEPTION 
            WHEN unique_violation THEN
                -- Email already exists with different ID - this is a problem
                RAISE NOTICE '⚠️  Conflict: % (email exists with different ID)', auth_user.email;
                skipped_count := skipped_count + 1;
        END;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '📊 Sync Summary:';
    RAISE NOTICE '   ✅ New users synced: %', synced_count;
    RAISE NOTICE '   🔄 Existing users updated: %', updated_count;
    RAISE NOTICE '   ⚠️  Skipped (conflicts): %', skipped_count;
    RAISE NOTICE '============================================================';
END $$;

-- Step 3: Show any remaining conflicts
DO $$
DECLARE
    conflict_rec RECORD;
    conflict_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Checking for email conflicts...';
    RAISE NOTICE '';
    
    FOR conflict_rec IN
        SELECT 
            au.id as auth_id,
            au.email,
            pu.id as public_id
        FROM auth.users au
        INNER JOIN public.users pu ON pu.email = au.email
        WHERE au.id != pu.id
    LOOP
        conflict_count := conflict_count + 1;
        RAISE NOTICE '⚠️  Email conflict: %', conflict_rec.email;
        RAISE NOTICE '   Auth ID: %', conflict_rec.auth_id;
        RAISE NOTICE '   Public ID: %', conflict_rec.public_id;
        RAISE NOTICE '';
    END LOOP;
    
    IF conflict_count = 0 THEN
        RAISE NOTICE '✅ No email conflicts found!';
    ELSE
        RAISE NOTICE '⚠️  Found % email conflicts. Manual resolution may be needed.', conflict_count;
    END IF;
END $$;
