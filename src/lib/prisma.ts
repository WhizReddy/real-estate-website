import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  // Only cache globally in development — in serverless production each invocation manages its own
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} catch (error) {
  console.error('[PRISMA_INIT_ERROR]', error);
  prisma = {} as PrismaClient;
}

export { prisma };