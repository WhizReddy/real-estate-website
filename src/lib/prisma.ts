import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  console.error('Please run "npx prisma generate" to generate the Prisma client');
  // Create a mock client that will gracefully fail
  prisma = {} as PrismaClient;
}

export { prisma };