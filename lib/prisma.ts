import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton
 *
 * This ensures we only have one instance of PrismaClient in development
 * to avoid exhausting database connections.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
