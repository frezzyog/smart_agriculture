const { Client } = require('pg');

const connectionString = "postgresql://postgres.waxcpawswvwzljiiitax:Dalin241205!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
