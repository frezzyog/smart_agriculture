const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.sensorData.count();
    console.log(`Total sensor data records: ${count}`);

    if (count > 0) {
        const latest = await prisma.sensorData.findMany({
            orderBy: { timestamp: 'desc' },
            take: 5
        });
        console.log('Latest 5 records:');
        console.log(JSON.stringify(latest, null, 2));
    } else {
        console.log('No sensor data found yet. Waiting for device to send data...');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
