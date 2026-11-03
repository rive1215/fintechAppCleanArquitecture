import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaUserRepository } from '../../src/infrastructure/repositories/PrismaUserRepository';
import { PrismaAccountRepository } from '../../src/infrastructure/repositories/PrismaAccountRepository';
import { User } from '../../src/domain/entities/User';
import { Account } from '../../src/domain/entities/Account';
import { Deposit, Transfer, Withdrawal } from '../../src/domain/entities/Transaction';
import { createTestPrismaClient, resetDatabase } from './helpers/prismaTestClient';

async function seedUser(prisma: PrismaClient, email: string): Promise<User> {
  const userRepo = new PrismaUserRepository(prisma);
  const user = User.create({
    id: crypto.randomUUID(),
    email,
    passwordHash: 'hash',
    fullName: 'Account Owner',
    createdAt: new Date(),
  });
  return userRepo.save(user);
}

describe('PrismaAccountRepository (integración)', () => {
  let prisma: PrismaClient;
  let repository: PrismaAccountRepository;

  beforeAll(() => {
    prisma = createTestPrismaClient();
    repository = new PrismaAccountRepository(prisma);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
  });

  it('save + findById / findByAccountNumber / findByUserId', async () => {
    const owner = await seedUser(prisma, 'owner.accounts@bank.test');
    const account = Account.create({
      id: crypto.randomUUID(),
      accountNumber: `ACC-${Date.now()}`,
      balance: new Decimal('150.00'),
      userId: owner.id,
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    const saved = await repository.save(account);

    expect(await repository.findById(saved.id!)).not.toBeNull();
    expect((await repository.findByAccountNumber(saved.accountNumber))?.id).toBe(saved.id);
    expect(await repository.findByUserId(owner.id)).toHaveLength(1);
  });

  it('freeze / unfreeze cambian el estado en DB', async () => {
    const owner = await seedUser(prisma, 'owner.freeze@bank.test');
    const account = await repository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-FZ-${Date.now()}`,
        balance: new Decimal(10),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );

    await repository.freeze(account);
    expect((await repository.findById(account.id!))?.status).toBe('FROZEN');

    await repository.unfreeze(account);
    expect((await repository.findById(account.id!))?.status).toBe('ACTIVE');
  });

  it('executeTransaction DEPOSIT acredita saldo y registra STI', async () => {
    const owner = await seedUser(prisma, 'owner.deposit@bank.test');
    const account = await repository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-DP-${Date.now()}`,
        balance: new Decimal(100),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );

    const deposit = Deposit.create({
      amount: new Decimal(50),
      status: 'PENDING',
      description: 'Ingreso integración',
      createdAt: new Date(),
      destinationAccountId: account.id!,
    });

    const savedTx = await repository.executeTransaction(deposit);
    const updated = await repository.findById(account.id!);

    expect(savedTx.status).toBe('COMPLETED');
    expect(updated?.balance.equals(new Decimal(150))).toBe(true);
  });

  it('executeTransaction WITHDRAWAL debita saldo suficiente', async () => {
    const owner = await seedUser(prisma, 'owner.withdraw@bank.test');
    const account = await repository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-WD-${Date.now()}`,
        balance: new Decimal(200),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );

    const withdrawal = Withdrawal.create({
      amount: new Decimal(80),
      status: 'PENDING',
      description: 'Retiro integración',
      createdAt: new Date(),
      sourceAccountId: account.id!,
    });

    await repository.executeTransaction(withdrawal);
    const updated = await repository.findById(account.id!);

    expect(updated?.balance.equals(new Decimal(120))).toBe(true);
  });

  it('executeTransaction TRANSFER mueve fondos de forma atómica', async () => {
    const owner = await seedUser(prisma, 'owner.transfer@bank.test');
    const source = await repository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-SRC-${Date.now()}`,
        balance: new Decimal(300),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );
    const destination = await repository.save(
      Account.create({
        id: crypto.randomUUID(),
        accountNumber: `ACC-DST-${Date.now()}`,
        balance: new Decimal(50),
        userId: owner.id,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );

    const transfer = Transfer.create({
      amount: new Decimal(100),
      status: 'PENDING',
      description: 'Transfer integración',
      createdAt: new Date(),
      sourceAccountId: source.id!,
      destinationAccountId: destination.id!,
    });

    await repository.executeTransaction(transfer);

    expect((await repository.findById(source.id!))?.balance.equals(new Decimal(200))).toBe(true);
    expect((await repository.findById(destination.id!))?.balance.equals(new Decimal(150))).toBe(true);
  });
});
