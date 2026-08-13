"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const defaultSessions = [
        { id: 'breakfast_d1', name: 'Day 1 Breakfast' },
        { id: 'lunch_d1', name: 'Day 1 Lunch' },
        { id: 'swag_bag', name: 'Swag Bag' }
    ];
    console.log('Seeding default counter sessions...');
    for (const session of defaultSessions) {
        const upserted = await prisma.counterSession.upsert({
            where: { id: session.id },
            update: {},
            create: {
                id: session.id,
                name: session.name,
                isOpen: false
            }
        });
        console.log(`- Session: ${upserted.id} (${upserted.name})`);
    }
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
