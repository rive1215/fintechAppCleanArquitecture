"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const PrismaUserRepository_1 = require("../../src/infrastructure/repositories/PrismaUserRepository");
const User_1 = require("../../src/domain/entities/User");
const prismaTestClient_1 = require("./helpers/prismaTestClient");
(0, vitest_1.describe)('PrismaUserRepository (integración)', () => {
    let prisma;
    let repository;
    (0, vitest_1.beforeAll)(() => {
        prisma = (0, prismaTestClient_1.createTestPrismaClient)();
        repository = new PrismaUserRepository_1.PrismaUserRepository(prisma);
    });
    (0, vitest_1.beforeEach)(async () => {
        await (0, prismaTestClient_1.resetDatabase)(prisma);
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, prismaTestClient_1.resetDatabase)(prisma);
        await prisma.$disconnect();
    });
    (0, vitest_1.it)('save + findById persisten y recuperan un usuario', async () => {
        const user = User_1.User.create({
            id: crypto.randomUUID(),
            email: 'user.repo@bank.test',
            passwordHash: 'hash-abc',
            fullName: 'User Repo',
            createdAt: new Date(),
        });
        const saved = await repository.save(user);
        const found = await repository.findById(saved.id);
        (0, vitest_1.expect)(found).not.toBeNull();
        (0, vitest_1.expect)(found?.email).toBe('user.repo@bank.test');
        (0, vitest_1.expect)(found?.fullName).toBe('User Repo');
    });
    (0, vitest_1.it)('findByEmail localiza por correo único', async () => {
        const user = User_1.User.create({
            id: crypto.randomUUID(),
            email: 'lookup@bank.test',
            passwordHash: 'hash',
            fullName: 'Lookup User',
            createdAt: new Date(),
        });
        await repository.save(user);
        const found = await repository.findByEmail('lookup@bank.test');
        const missing = await repository.findByEmail('missing@bank.test');
        (0, vitest_1.expect)(found?.id).toBe(user.id);
        (0, vitest_1.expect)(missing).toBeNull();
    });
    (0, vitest_1.it)('save actualiza datos existentes (upsert)', async () => {
        const id = crypto.randomUUID();
        const original = User_1.User.create({
            id,
            email: 'upsert@bank.test',
            passwordHash: 'hash-1',
            fullName: 'Original Name',
            createdAt: new Date(),
        });
        await repository.save(original);
        const updated = User_1.User.create({
            id,
            email: 'upsert@bank.test',
            passwordHash: 'hash-2',
            fullName: 'Updated Name',
            createdAt: original.createdAt,
        });
        await repository.save(updated);
        const found = await repository.findById(id);
        (0, vitest_1.expect)(found?.fullName).toBe('Updated Name');
        (0, vitest_1.expect)(found?.passwordHash).toBe('hash-2');
    });
});
//# sourceMappingURL=PrismaUserRepository.integration.test.js.map