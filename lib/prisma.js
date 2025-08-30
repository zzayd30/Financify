import { PrismaClient } from '@/lib/generated/prisma';

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined!");
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const db = prisma;
