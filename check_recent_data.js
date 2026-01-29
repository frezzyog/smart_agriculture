const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    console.log(`Checking for data since: ${fiveMinutesAgo.toISOString()}`);

    const latestData = await prisma.sensorData.findMany({
        where: {
            timestamp: {
                gte: fiveMinutesAgo
            }
        },
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            device: true
        }
    });

    console.log(`Found ${latestData.length} records in the last 5 minutes.`);
    latestData.forEach(d => {
        console.log(`[${d.timestamp.toISOString()}] Device: ${d.device?.deviceId} | Moisture: ${d.moisture}% | Rain: ${d.rain}%`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
