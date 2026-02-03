const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deviceId = 'SMARTAG-001';
    const device = await prisma.device.findUnique({
        where: { deviceId }
    });

    if (device) {
        console.log(`✅ Device Found: ${device.name} (UUID: ${device.id})`);
        const latest = await prisma.sensorData.findFirst({
            where: { deviceId: device.id },
            orderBy: { timestamp: 'desc' }
        });
        if (latest) {
            console.log('🕒 Latest Data Timestamp:', latest.timestamp);
            console.log('🕒 Current Time:', new Date().toISOString());
        } else {
            console.log('❌ No sensor data found for this device');
        }
    } else {
        console.log(`❌ Device NOT FOUND: ${deviceId}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
