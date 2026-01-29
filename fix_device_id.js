const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.device.findUnique({
        where: { deviceId: 'DEVICE_001' }
    });

    if (existing) {
        await prisma.device.update({
            where: { deviceId: 'DEVICE_001' },
            data: { deviceId: 'SMARTAG-001', name: 'Smart Agriculture Node 1' }
        });
        console.log('✅ Updated DEVICE_001 to SMARTAG-001');
    } else {
        // If DEVICE_001 doesn't exist, try to find ANY user to attach it to
        const user = await prisma.user.findFirst();
        if (user) {
            await prisma.device.create({
                data: {
                    deviceId: 'SMARTAG-001',
                    name: 'Smart Agriculture Node 1',
                    type: 'COMBO',
                    userId: user.id
                }
            });
            console.log('✅ Created new device: SMARTAG-001');
        } else {
            console.log('❌ No user found to attach device to');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
