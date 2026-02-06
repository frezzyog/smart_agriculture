// Sync all Supabase Auth users to public.users table
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function syncAuthUsers() {
    try {
        console.log('🔄 Starting sync of Supabase Auth users to public.users table...\n');

        // 1. Get all users from Supabase Auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            throw new Error(`Failed to fetch auth users: ${authError.message}`);
        }

        console.log(`📋 Found ${authUsers.users.length} users in Supabase Auth\n`);

        // 2. Get existing users in public.users
        const { data: existingUsers, error: existingError } = await supabase
            .from('users')
            .select('id');

        if (existingError) {
            console.warn('⚠️ Could not fetch existing users:', existingError.message);
        }

        const existingUserIds = new Set(existingUsers?.map(u => u.id) || []);
        console.log(`📊 Found ${existingUserIds.size} users already in public.users table\n`);

        // 3. Sync each auth user to public.users
        let syncedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const authUser of authUsers.users) {
            const userId = authUser.id;
            const email = authUser.email;
            const metadata = authUser.user_metadata || {};
            const name = metadata.name || email.split('@')[0];
            const phone = metadata.phone || null;
            const role = (metadata.role || 'USER').toUpperCase();

            if (existingUserIds.has(userId)) {
                console.log(`⏭️  Skipping ${email} (already exists)`);
                skippedCount++;
                continue;
            }

            try {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        email: email,
                        name: name,
                        phone: phone,
                        password: 'SUPABASE_AUTH',
                        role: role,
                        created_at: authUser.created_at,
                        updated_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error(`❌ Failed to sync ${email}:`, insertError.message);
                    errorCount++;
                } else {
                    console.log(`✅ Synced ${email} (${name})`);
                    syncedCount++;
                }
            } catch (err) {
                console.error(`❌ Error syncing ${email}:`, err.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Sync Summary:');
        console.log(`   ✅ Synced: ${syncedCount}`);
        console.log(`   ⏭️  Skipped (already exists): ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log('='.repeat(60));

        if (syncedCount > 0) {
            console.log('\n🎉 User sync completed successfully!');
        } else if (errorCount > 0) {
            console.log('\n⚠️ Sync completed with errors. Please check the logs above.');
        } else {
            console.log('\n✨ All users were already synced!');
        }

    } catch (error) {
        console.error('❌ Fatal error during sync:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncAuthUsers()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Unhandled error:', err);
        process.exit(1);
    });
