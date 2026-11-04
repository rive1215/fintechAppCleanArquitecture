"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const PrismaUserRepository_1 = require("../../src/infrastructure/repositories/PrismaUserRepository");
const PrismaAccountRepository_1 = require("../../src/infrastructure/repositories/PrismaAccountRepository");
const PrismaTransactionRepository_1 = require("../../src/infrastructure/repositories/PrismaTransactionRepository");
const User_1 = require("../../src/domain/entities/User");
const Account_1 = require("../../src/domain/entities/Account");
const Transaction_1 = require("../../src/domain/entities/Transaction");
const prismaTestClient_1 = require("./helpers/prismaTestClient");
(0, vitest_1.describe)('PrismaTransactionRepository (integración)', () => {
    let prisma;
    let accountRepository;
    let transactionRepository;
    let accountA;
    let accountB;
    (0, vitest_1.beforeAll)(() => {
        prisma = (0, prismaTestClient_1.createTestPrismaClient)();
        accountRepository = new PrismaAccountRepository_1.PrismaAccountRepository(prisma);
        transactionRepository = new PrismaTransactionRepository_1.PrismaTransactionRepository(prisma);
    });
    (0, vitest_1.beforeEach)(async () => {
        await (0, prismaTestClient_1.resetDatabase)(prisma);
        const userRepo = new PrismaUserRepository_1.PrismaUserRepository(prisma);
        const owner = await userRepo.save(User_1.User.create({
            id: crypto.randomUUID(),
            email: `tx.owner.${Date.now()}@bank.test`,
            passwordHash: 'hash',
            fullName: 'Tx Owner',
            createdAt: new Date(),
        }));
        accountA = await accountRepository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-A-${Date.now()}`,
            balance: new decimal_js_1.Decimal(500),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
        accountB = await accountRepository.save(Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber: `ACC-B-${Date.now()}`,
            balance: new decimal_js_1.Decimal(100),
            userId: owner.id,
            status: 'ACTIVE',
            createdAt: new Date(),
        }));
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, prismaTestClient_1.resetDatabase)(prisma);
        await prisma.$disconnect();
    });
    (0, vitest_1.it)('save + findById reconstruyen Deposit (STI)', async () => {
        const deposit = Transaction_1.Deposit.create({
            amount: new decimal_js_1.Decimal(25),
            status: 'PENDING',
            description: 'Depósito repo',
            createdAt: new Date(),
            destinationAccountId: accountA.id,
        });
        const saved = await transactionRepository.save(deposit);
        const found = await transactionRepository.findById(saved.id);
        (0, vitest_1.expect)(found).toBeInstanceOf(Transaction_1.Deposit);
        (0, vitest_1.expect)(found?.amount.equals(25)).toBe(true);
        (0, vitest_1.expect)(found.destinationAccount).toBe(accountA.id);
    });
    (0, vitest_1.it)('findByAccountId retorna historial de la cuenta (origen o destino)', async () => {
        await accountRepository.executeTransaction(Transaction_1.Deposit.create({
            amount: new decimal_js_1.Decimal(40),
            status: 'PENDING',
            description: 'dep',
            createdAt: new Date('2026-03-01T10:00:00.000Z'),
            destinationAccountId: accountA.id,
        }));
        await accountRepository.executeTransaction(Transaction_1.Withdrawal.create({
            amount: new decimal_js_1.Decimal(15),
            status: 'PENDING',
            description: 'wd',
            createdAt: new Date('2026-03-02T10:00:00.000Z'),
            sourceAccountId: accountA.id,
        }));
        await accountRepository.executeTransaction(Transaction_1.Transfer.create({
            amount: new decimal_js_1.Decimal(10),
            status: 'PENDING',
            description: 'tr',
            createdAt: new Date('2026-03-03T10:00:00.000Z'),
            sourceAccountId: accountA.id,
            destinationAccountId: accountB.id,
        }));
        const historyA = await transactionRepository.findByAccountId(accountA.id);
        const historyB = await transactionRepository.findByAccountId(accountB.id);
        (0, vitest_1.expect)(historyA).toHaveLength(3);
        (0, vitest_1.expect)(historyB).toHaveLength(1);
        (0, vitest_1.expect)(historyB[0]).toBeInstanceOf(Transaction_1.Transfer);
    });
    (0, vitest_1.it)('save con id hace upsert de status/description', async () => {
        const created = await transactionRepository.save(Transaction_1.Deposit.create({
            id: crypto.randomUUID(),
            amount: new decimal_js_1.Decimal(10),
            status: 'PENDING',
            description: 'pendiente',
            createdAt: new Date(),
            destinationAccountId: accountA.id,
        }));
        created.markAsCompleted();
        const updated = await transactionRepository.save(Transaction_1.Deposit.create({
            id: created.id,
            amount: created.amount,
            status: created.status,
            description: 'completado',
            createdAt: created.createdAt,
            destinationAccountId: accountA.id,
        }));
        (0, vitest_1.expect)(updated.status).toBe('COMPLETED');
        (0, vitest_1.expect)(updated.description).toBe('completado');
    });
});
//# sourceMappingURL=PrismaTransactionRepository.integration.test.js.map