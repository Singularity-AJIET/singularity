import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
declare const prisma: PrismaClient<{
    adapter: PrismaLibSQL;
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export { prisma };
export default prisma;
