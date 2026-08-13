require("dotenv").config();
const { prisma } = require('./dist/services/db.js');

async function main() {
  // Define new sessions
  const newSessions = [
    { id: '1_breakfast_d1', name: 'Day 1 Breakfast' },
    { id: '2_lunch_d1', name: 'Lunch' },
    { id: '3_coffeesnacks_d1', name: 'Coffee / Snacks' },
    { id: '4_dinner_d1', name: 'Dinner' },
    { id: '5_breakfast_d2', name: 'Day 2 Breakfast' },
    { id: '6_lunch_d2', name: 'Day 2 Lunch' }
  ];

  // Map old IDs to new IDs in Claims (so we don't lose data)
  const idMapping = {
    'breakfast_d1': '1_breakfast_d1',
    'lunch_d1': '2_lunch_d1'
  };

  // 1. Insert new sessions first to satisfy foreign key constraints
  for (const s of newSessions) {
    await prisma.counterSession.upsert({
      where: { id: s.id },
      update: { name: s.name },
      create: {
        id: s.id,
        name: s.name,
        isOpen: false
      }
    });
  }

  // 2. Map old IDs to new IDs in Claims
  for (const [oldId, newId] of Object.entries(idMapping)) {
     await prisma.claim.updateMany({
        where: { itemType: oldId },
        data: { itemType: newId }
     });
  }

  // 3. Delete all old counter sessions that are not in the new list
  const newSessionIds = newSessions.map(s => s.id);
  await prisma.counterSession.deleteMany({
      where: {
          id: { notIn: newSessionIds }
      }
  });
  
  console.log("Sessions updated!");
}
main().catch(console.error);
