const { PrismaClient } = require('@prisma/client');

// Force direct connection for testing
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.waxcpawswvwzljiiitax:Dalin241205%21@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
        },
    },
});

async function main() {
    try {
        console.log('Testing DIRECT connection to Supabase...');
        const userCount = await prisma.user.count();
        console.log('--- Success! ---');
        console.log('Users found:', userCount);
    } catch (error) {
        console.error('❌ STILL FAILING:', error.message);
        console.log('\nHint: Please go to Supabase > Settings > Database > Connection String and COPIED the exact URL from the "Direct Connection" tab.');
    } finally {
        await prisma.$disconnect();
    }
}

main();
