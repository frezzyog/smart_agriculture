const { Client } = require('pg');

const config = {
    user: 'postgres.waxcpawswvwzljiiitax',
    password: 'SmartAgriculture2026',
    database: 'postgres',
};

const tests = [
    {
        name: "Singapore Pooler (Port 6543)",
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 6543,
    },
    {
        name: "Direct Host (Port 6543)",
        host: 'db.waxcpawswvwzljiiitax.supabase.co',
        port: 6543,
    },
    {
        name: "Direct Host (Port 5432) - Standard",
        host: 'db.waxcpawswvwzljiiitax.supabase.co',
        port: 5432,
    }
];

async function runTests() {
    console.log("🚀 Starting Database Connection Diagnostics...\n");

    for (const test of tests) {
        console.log(`Testing: ${test.name}`);
        console.log(`URL: postgres://${config.user}:****@${test.host}:${test.port}/postgres`);

        const client = new Client({
            ...config,
            host: test.host,
            port: test.port,
            connectionTimeoutMillis: 5000,
        });

        try {
            await client.connect();
            console.log("✅ SUCCESS!");
            const res = await client.query('SELECT NOW()');
            console.log("🕒 Database Time:", res.rows[0].now);
            await client.end();
            console.log("\n-----------------------------------\n");
            return; // Stop if we find one that works
        } catch (err) {
            console.error("❌ FAILED");
            console.error("Error Message:", err.message);
            if (err.message.includes("Tenant or user not found")) {
                console.log("💡 Hint: This means the Host or User ID is slightly wrong.");
            } else if (err.message.includes("timeout") || err.message.includes("ECONNREFUSED")) {
                console.log("💡 Hint: This port is likely blocked by your firewall.");
            }
            console.log("\n-----------------------------------\n");
        }
    }

    console.log("❌ All connection attempts failed.");
    console.log("Please double-check your Region in Supabase Settings > Database.");
}

runTests();
