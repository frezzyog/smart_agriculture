const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting database cleanup...');

    try {
        // Delete all records from sensor_data and pump_logs
        const deletedSensorData = await prisma.sensorData.deleteMany({});
        const deletedPumpLogs = await prisma.pumpLog.deleteMany({});

        console.log(`✅ Successfully deleted ${deletedSensorData.count} sensor data records.`);
        console.log(`✅ Successfully deleted ${deletedPumpLogs.count} pump log records.`);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
        console.log('✨ Cleanup complete.');
    }
}

main();
