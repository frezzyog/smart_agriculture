const { Client } = require('pg');

const config = {
    user: 'postgres.waxcpawswvwzljiiitax',
    password: 'SmartAgriculture2026',
    database: 'postgres',
};

// Trying various Supabase regions just in case
const regions = [
    'ap-southeast-1', // Singapore (Default)
    'ap-southeast-2', // Sydney
    'ap-northeast-1', // Tokyo
    'us-east-1',      // N. Virginia
    'eu-central-1',   // Frankfurt
];

async function scanRegions() {
    console.log("🔍 Scanning Supabase Regions for your project...\n");

    for (const region of regions) {
        const host = `aws-0-${region}.pooler.supabase.com`;
        console.log(`Testing Region: ${region} (${host})`);

        const client = new Client({
            ...config,
            host: host,
            port: 6543,
            connectionTimeoutMillis: 5000,
        });

        try {
            await client.connect();
            console.log("✅ FOUND IT! THIS IS YOUR REGION.");
            await client.end();
            console.log(`\nYour correct DATABASE_URL is:\npostgresql://postgres.waxcpawswvwzljiiitax:SmartAgriculture2026@${host}:6543/postgres?pgbouncer=true`);
            return;
        } catch (err) {
            if (err.message.includes("Tenant or user not found")) {
                console.log("❌ Not here (Tenant not found)");
            } else {
                console.log(`❌ Error: ${err.message}`);
            }
        }
    }

    console.log("\n❌ Could not find project in common regions.");
}

scanRegions();
