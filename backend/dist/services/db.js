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
export { prisma };
export default prisma;
