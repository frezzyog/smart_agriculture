const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting cleanup of old sensor data...');

    // Delete all sensor data
    const deletedData = await prisma.sensorData.deleteMany({});
    console.log(`✅ Deleted ${deletedData.count} sensor data records.`);

    // Delete all alerts (optional but recommended for a clean start)
    const deletedAlerts = await prisma.alert.deleteMany({});
    console.log(`✅ Deleted ${deletedAlerts.count} alerts.`);

    // Delete all pump logs (optional)
    const deletedLogs = await prisma.pumpLog.deleteMany({});
    console.log(`✅ Deleted ${deletedLogs.count} pump logs.`);

    console.log('\n✨ Database is now clean! Waiting for fresh data from your device...');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
