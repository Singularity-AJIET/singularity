import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const libsql = createClient({
  url,
  authToken: authToken || undefined,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function clearClaims() {
  console.log('Clearing all claims from database...');
  const deleted = await prisma.claim.deleteMany({});
  console.log(`Successfully deleted ${deleted.count} claim records.`);

  // Ensure all existing counters are open for testing
  await prisma.counterSession.updateMany({
    data: {
      isOpen: true,
      openedAt: new Date(),
      closedAt: null
    }
  });
  console.log('All existing counters are OPEN and ready for scanning!');
}

clearClaims()
  .catch((err) => {
    console.error('Error clearing claims:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
