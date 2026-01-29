const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const devices = await prisma.device.findMany({ select: { deviceId: true, name: true } });
    devices.forEach(d => console.log(`ID: ${d.deviceId} | Name: ${d.name}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
