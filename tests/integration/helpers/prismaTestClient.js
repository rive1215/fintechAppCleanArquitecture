"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestPrismaClient = createTestPrismaClient;
exports.resetDatabase = resetDatabase;
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../../../src/generated/prisma/client");
/**
 * Cliente Prisma apuntando a la misma DB del entorno (Docker local).
 * Usado exclusivamente por pruebas de integración de repositorios.
 */
function createTestPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL es requerida para pruebas de integración.');
    }
    return new client_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg({ connectionString }),
    });
}
/**
 * Limpia tablas respetando FKs (transacciones → cuentas → usuarios).
 */
async function resetDatabase(prisma) {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
}
//# sourceMappingURL=prismaTestClient.js.map