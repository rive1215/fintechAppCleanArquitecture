import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../src/generated/prisma/client';

/**
 * Cliente Prisma apuntando a la misma DB del entorno (Docker local).
 * Usado exclusivamente por pruebas de integración de repositorios.
 */
export function createTestPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL es requerida para pruebas de integración.');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

/**
 * Limpia tablas respetando FKs (transacciones → cuentas → usuarios).
 */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}
