import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaUserRepository } from '../../src/infrastructure/repositories/PrismaUserRepository';
import { PrismaAccountRepository } from '../../src/infrastructure/repositories/PrismaAccountRepository';
import { PrismaTransactionRepository } from '../../src/infrastructure/repositories/PrismaTransactionRepository';
import { User } from '../../src/domain/entities/User';
import { Account } from '../../src/domain/entities/Account';
import { Deposit, Withdrawal, Transfer } from '../../src/domain/entities/Transaction';
import { createTestPrismaClient, resetDatabase } from './helpers/prismaTestClient';

describe('PrismaTransactionRepository (integración)', () => {
  let prisma: PrismaClient;
  let accountRepository: PrismaAccountRepository;
  let transactionRepository: PrismaTransactionRepository;
  let accountA: Account;
  let accountB: Account;

  beforeAll(() => {
    prisma = createTestPrismaClient();
    accountRepository = new PrismaAccountRepository(prisma);
    transactionRepository = new PrismaTransactionRepository(prisma);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);

    const userRepo = new PrismaUserRepository(prisma);
    const owner = await userRepo.save(
      User.create({
        id: crypto.randomUUID(),
        email: `tx.owner.${Date.now()}@bank.test`,
        passwordHash: 'hash',
        fullName: 'Tx Owner',
        createdAt: new Date(),
      }),
    );

    accountA = await accountRepository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-A-${Date.now()}`,
        balance: new Decimal(500),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );
    accountB = await accountRepository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-B-${Date.now()}`,
        balance: new Decimal(100),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
  });

  it('save + findById reconstruyen Deposit (STI)', async () => {
    const deposit = Deposit.create({
      amount: new Decimal(25),
      status: 'PENDING',
      description: 'Depósito repo',
      createdAt: new Date(),
      destinationAccountId: accountA.id!,
    });

    const saved = await transactionRepository.save(deposit);
    const found = await transactionRepository.findById(saved.id!);

    expect(found).toBeInstanceOf(Deposit);
    expect(found?.amount.equals(25)).toBe(true);
    expect((found as Deposit).destinationAccount).toBe(accountA.id);
  });

  it('findByAccountId retorna historial de la cuenta (origen o destino)', async () => {
    await accountRepository.executeTransaction(
      Deposit.create({
        amount: new Decimal(40),
        status: 'PENDING',
        description: 'dep',
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        destinationAccountId: accountA.id!,
      }),
    );
    await accountRepository.executeTransaction(
      Withdrawal.create({
        amount: new Decimal(15),
        status: 'PENDING',
        description: 'wd',
        createdAt: new Date('2026-03-02T10:00:00.000Z'),
        sourceAccountId: accountA.id!,
      }),
    );
    await accountRepository.executeTransaction(
      Transfer.create({
        amount: new Decimal(10),
        status: 'PENDING',
        description: 'tr',
        createdAt: new Date('2026-03-03T10:00:00.000Z'),
        sourceAccountId: accountA.id!,
        destinationAccountId: accountB.id!,
      }),
    );

    const historyA = await transactionRepository.findByAccountId(accountA.id!);
    const historyB = await transactionRepository.findByAccountId(accountB.id!);

    expect(historyA).toHaveLength(3);
    expect(historyB).toHaveLength(1);
    expect(historyB[0]).toBeInstanceOf(Transfer);
  });

  it('save con id hace upsert de status/description', async () => {
    const created = await transactionRepository.save(
      Deposit.create({
        id: crypto.randomUUID(),
        amount: new Decimal(10),
        status: 'PENDING',
        description: 'pendiente',
        createdAt: new Date(),
        destinationAccountId: accountA.id!,
      }),
    );

    created.markAsCompleted();
    const updated = await transactionRepository.save(
      Deposit.create({
        id: created.id,
        amount: created.amount,
        status: created.status,
        description: 'completado',
        createdAt: created.createdAt,
        destinationAccountId: accountA.id!,
      }),
    );

    expect(updated.status).toBe('COMPLETED');
    expect(updated.description).toBe('completado');
  });
});
