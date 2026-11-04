"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const PrismaUserRepository_1 = require("../../src/infrastructure/repositories/PrismaUserRepository");
const PrismaAccountRepository_1 = require("../../src/infrastructure/repositories/PrismaAccountRepository");
const User_1 = require("../../src/domain/entities/User");
const Account_1 = require("../../src/domain/entities/Account");
const Transaction_1 = require("../../src/domain/entities/Transaction");
const prismaTestClient_1 = require("./helpers/prismaTestClient");
async function seedUser(prisma, email) {
    const userRepo = new PrismaUserRepository_1.PrismaUserRepository(prisma);
    const user = User_1.User.create({
        id: crypto.randomUUID(),
        email,
        passwordHash: 'hash',
        fullName: 'Account Owner',
        createdAt: new Date(),
    });
    return userRepo.save(user);
}
(0, vitest_1.describe)('PrismaAccountRepository (integración)', () => {
    let prisma;
    let repository;
    (0, vitest_1.beforeAll)(() => {
        prisma = (0, prismaTestClient_1.createTestPrismaClient)();
        repository = new PrismaAccountRepository_1.PrismaAccountRepository(prisma);
    });
    (0, vitest_1.beforeEach)(async () => {
        await (0, prismaTestClient_1.resetDatabase)(prisma);
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, prismaTestClient_1.resetDatabase)(prisma);
        await prisma.$disconnect();
    });
    (0, vitest_1.it)('save + findById / findByAccountNumber / findByUserId', async () => {
        const owner = await seedUser(prisma, 'owner.accounts@bank.test');
        const account = Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-${Date.now()}`,
            balance: new decimal_js_1.Decimal('150.00'),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        });
        const saved = await repository.save(account);
        (0, vitest_1.expect)(await repository.findById(saved.id)).not.toBeNull();
        (0, vitest_1.expect)((await repository.findByAccountNumber(saved.accountNumber))?.id).toBe(saved.id);
        (0, vitest_1.expect)(await repository.findByUserId(owner.id)).toHaveLength(1);
    });
    (0, vitest_1.it)('freeze / unfreeze cambian el estado en DB', async () => {
        const owner = await seedUser(prisma, 'owner.freeze@bank.test');
        const account = await repository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-FZ-${Date.now()}`,
            balance: new decimal_js_1.Decimal(10),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
        await repository.freeze(account);
        (0, vitest_1.expect)((await repository.findById(account.id))?.status).toBe('FROZEN');
        await repository.unfreeze(account);
        (0, vitest_1.expect)((await repository.findById(account.id))?.status).toBe('ACTIVE');
    });
    (0, vitest_1.it)('executeTransaction DEPOSIT acredita saldo y registra STI', async () => {
        const owner = await seedUser(prisma, 'owner.deposit@bank.test');
        const account = await repository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-DP-${Date.now()}`,
            balance: new decimal_js_1.Decimal(100),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
        const deposit = Transaction_1.Deposit.create({
            amount: new decimal_js_1.Decimal(50),
            status: 'PENDING',
            description: 'Ingreso integración',
            createdAt: new Date(),
            destinationAccountId: account.id,
        });
        const savedTx = await repository.executeTransaction(deposit);
        const updated = await repository.findById(account.id);
        (0, vitest_1.expect)(savedTx.status).toBe('COMPLETED');
        (0, vitest_1.expect)(updated?.balance.equals(new decimal_js_1.Decimal(150))).toBe(true);
    });
    (0, vitest_1.it)('executeTransaction WITHDRAWAL debita saldo suficiente', async () => {
        const owner = await seedUser(prisma, 'owner.withdraw@bank.test');
        const account = await repository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-WD-${Date.now()}`,
            balance: new decimal_js_1.Decimal(200),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
        const withdrawal = Transaction_1.Withdrawal.create({
            amount: new decimal_js_1.Decimal(80),
            status: 'PENDING',
            description: 'Retiro integración',
            createdAt: new Date(),
            sourceAccountId: account.id,
        });
        await repository.executeTransaction(withdrawal);
        const updated = await repository.findById(account.id);
        (0, vitest_1.expect)(updated?.balance.equals(new decimal_js_1.Decimal(120))).toBe(true);
    });
    (0, vitest_1.it)('executeTransaction TRANSFER mueve fondos de forma atómica', async () => {
        const owner = await seedUser(prisma, 'owner.transfer@bank.test');
        const source = await repository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-SRC-${Date.now()}`,
            balance: new decimal_js_1.Decimal(300),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
        const destination = await repository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-DST-${Date.now()}`,
            balance: new decimal_js_1.Decimal(50),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
        const transfer = Transaction_1.Transfer.create({
            amount: new decimal_js_1.Decimal(100),
            status: 'PENDING',
            description: 'Transfer integración',
            createdAt: new Date(),
            sourceAccountId: source.id,
            destinationAccountId: destination.id,
        });
        await repository.executeTransaction(transfer);
        (0, vitest_1.expect)((await repository.findById(source.id))?.balance.equals(new decimal_js_1.Decimal(200))).toBe(true);
        (0, vitest_1.expect)((await repository.findById(destination.id))?.balance.equals(new decimal_js_1.Decimal(150))).toBe(true);
    });
});
//# sourceMappingURL=PrismaAccountRepository.integration.test.js.map