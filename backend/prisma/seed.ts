import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to hash password using scrypt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const defaultSessions = [
    { id: '1_breakfast_d1', name: 'Day 1 Breakfast' },
    { id: '2_lunch_d1', name: 'Lunch' },
    { id: '3_coffeesnacks_d1', name: 'Coffee / Snacks' },
    { id: '4_dinner_d1', name: 'Dinner' },
    { id: '5_breakfast_d2', name: 'Day 2 Breakfast' },
    { id: '6_lunch_d2', name: 'Day 2 Lunch' }
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

  // 2. Seed default admin account
  console.log('\nSeeding default administrator...');
  const defaultUsername = 'admin';
  const defaultPassword = 'admin123';

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: defaultUsername }
  });

  if (!existingAdmin) {
    const hashedPassword = hashPassword(defaultPassword);
    await prisma.admin.create({
      data: {
        username: defaultUsername,
        password: hashedPassword,
        name: 'Default Administrator'
      }
    });
    console.log(`- Created admin account: "${defaultUsername}" with password "${defaultPassword}"`);
  } else {
    console.log(`- Admin account "${defaultUsername}" already exists, skipping.`);
  }

  console.log('\nSeeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
