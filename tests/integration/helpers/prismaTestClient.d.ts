import 'dotenv/config';
import { PrismaClient } from '../../../src/generated/prisma/client';
/**
 * Cliente Prisma apuntando a la misma DB del entorno (Docker local).
 * Usado exclusivamente por pruebas de integración de repositorios.
 */
export declare function createTestPrismaClient(): PrismaClient;
/**
 * Limpia tablas respetando FKs (transacciones → cuentas → usuarios).
 */
export declare function resetDatabase(prisma: PrismaClient): Promise<void>;
//# sourceMappingURL=prismaTestClient.d.ts.map