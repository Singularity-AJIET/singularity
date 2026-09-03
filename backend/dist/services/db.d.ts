import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
declare const libsqlClient: import("@libsql/client").Client;
declare const prisma: PrismaClient<{
    adapter: PrismaLibSQL;
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export { prisma, libsqlClient };
export default prisma;
export declare function initDatabaseTables(): Promise<void>;
