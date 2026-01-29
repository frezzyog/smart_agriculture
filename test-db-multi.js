const { Client } = require('pg');

const tests = [
    "postgresql://postgres.waxcpawswvwzljiiitax:Dalin241205!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    "postgresql://postgres.waxcpawswvwzljiiitax:Dalin241205!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres:Dalin241205!@db.waxcpawswvwzljiiitax.supabase.co:6543/postgres",
    "postgresql://postgres:Dalin241205!@db.waxcpawswvwzljiiitax.supabase.co:5432/postgres"
];

async function runTests() {
    for (const connectionString of tests) {
        console.log(`\nTesting: ${connectionString.split(':')[0]}...`);
        const client = new Client({
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log('✅ Success!');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.error('❌ Failed:', err.message);
        }
    }
}

runTests();
