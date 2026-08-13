import { prisma } from './src/services/db.js';

async function clear() {
  console.log('Purging transaction tables...');
  await prisma.claim.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.eventStaff.deleteMany({});
  await prisma.team.deleteMany({});
  
  await prisma.counterSession.updateMany({
    data: {
      isOpen: false,
      openedAt: null,
      closedAt: null
    }
  });
  console.log('Database tables purged successfully!');
}

clear()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
