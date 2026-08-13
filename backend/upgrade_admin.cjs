require("dotenv").config();
const { prisma } = require('./dist/services/db.js');

async function main() {
  // Add the role column to Turso (raw SQL, safe to run even if column exists via ignore)
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'`);
    console.log('Column `role` added to admins table.');
  } catch (e) {
    if (e.message && e.message.includes('duplicate column')) {
      console.log('Column `role` already exists, skipping ALTER TABLE.');
    } else {
      throw e;
    }
  }

  // Upgrade all existing admins to superadmin
  const result = await prisma.admin.updateMany({
    data: { role: 'superadmin' }
  });
  console.log(`Upgraded ${result.count} admin(s) to superadmin.`);
  
  const admins = await prisma.admin.findMany({ select: { id: true, username: true, role: true } });
  console.log('Current admins:', admins);
}
main().catch(console.error).finally(() => prisma.$disconnect());
