 
 
import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("Database configuration error: TURSO_DATABASE_URL environment variable is not defined.");
}

console.log('Connecting to database via LibSQL adapter (Turso)...');

const libsqlClient = createClient({
  url: databaseUrl,
  authToken: authToken,
});

const adapter = new PrismaLibSQL(libsqlClient);
const prisma = new PrismaClient({ adapter });

export { prisma, libsqlClient };
export default prisma;

// Auto-initialize countdown_state table in Turso
export async function initDatabaseTables() {
  try {
    await libsqlClient.execute(`
      CREATE TABLE IF NOT EXISTS countdown_state (
        id TEXT PRIMARY KEY,
        is_displayed INTEGER NOT NULL DEFAULT 0,
        is_started INTEGER NOT NULL DEFAULT 0,
        started_at TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await libsqlClient.execute(`
      INSERT OR IGNORE INTO countdown_state (id, is_displayed, is_started)
      VALUES ('default', 0, 0);
    `);
  } catch (err) {
    console.error("Failed to ensure countdown_state table:", err);
  }
}

initDatabaseTables().catch((err) => console.error("Database init error:", err));
