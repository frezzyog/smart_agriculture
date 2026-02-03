const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deviceId = 'SMARTAG-001';
    const device = await prisma.device.findUnique({
        where: { deviceId }
    });

    if (device) {
        console.log(`✅ Device Found: ${device.name} (UUID: ${device.id})`);
        const count = await prisma.sensorData.count({
            where: { deviceId: device.id }
        });
        console.log(`📊 Sensor Data Count: ${count}`);

        if (count > 0) {
            const latest = await prisma.sensorData.findFirst({
                where: { deviceId: device.id },
                orderBy: { timestamp: 'desc' }
            });
            console.log('🕒 Latest Data Timestamp:', latest.timestamp);
        }
    } else {
        console.log(`❌ Device NOT FOUND: ${deviceId}`);
        const allDevices = await prisma.device.findMany();
        console.log('Available Device IDs:', allDevices.map(d => d.deviceId));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
