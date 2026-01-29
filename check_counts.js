const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const deviceCount = await prisma.device.count();
        const sensorCount = await prisma.sensorData.count();
        const zoneCount = await prisma.zone.count();

        console.log('--- Database Status ---');
        console.log('Users:', userCount);
        console.log('Devices:', deviceCount);
        console.log('Sensor Rows:', sensorCount);
        console.log('Zones:', zoneCount);
        console.log('-----------------------');

        if (userCount === 0) {
            console.log('⚠️ Your database is completely empty.');
        } else {
            console.log('✅ Database connected, but some tables might be empty.');
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
