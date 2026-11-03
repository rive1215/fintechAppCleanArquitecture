import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaUserRepository } from '../../src/infrastructure/repositories/PrismaUserRepository';
import { User } from '../../src/domain/entities/User';
import { createTestPrismaClient, resetDatabase } from './helpers/prismaTestClient';

describe('PrismaUserRepository (integración)', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeAll(() => {
    prisma = createTestPrismaClient();
    repository = new PrismaUserRepository(prisma);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
  });

  it('save + findById persisten y recuperan un usuario', async () => {
    const user = User.create({
      id: crypto.randomUUID(),
      email: 'user.repo@bank.test',
      passwordHash: 'hash-abc',
      fullName: 'User Repo',
      createdAt: new Date(),
    });

    const saved = await repository.save(user);
    const found = await repository.findById(saved.id);

    expect(found).not.toBeNull();
    expect(found?.email).toBe('user.repo@bank.test');
    expect(found?.fullName).toBe('User Repo');
  });

  it('findByEmail localiza por correo único', async () => {
    const user = User.create({
      id: crypto.randomUUID(),
      email: 'lookup@bank.test',
      passwordHash: 'hash',
      fullName: 'Lookup User',
      createdAt: new Date(),
    });
    await repository.save(user);

    const found = await repository.findByEmail('lookup@bank.test');
    const missing = await repository.findByEmail('missing@bank.test');

    expect(found?.id).toBe(user.id);
    expect(missing).toBeNull();
  });

  it('save actualiza datos existentes (upsert)', async () => {
    const id = crypto.randomUUID();
    const original = User.create({
      id,
      email: 'upsert@bank.test',
      passwordHash: 'hash-1',
      fullName: 'Original Name',
      createdAt: new Date(),
    });
    await repository.save(original);

    const updated = User.create({
      id,
      email: 'upsert@bank.test',
      passwordHash: 'hash-2',
      fullName: 'Updated Name',
      createdAt: original.createdAt,
    });
    await repository.save(updated);

    const found = await repository.findById(id);
    expect(found?.fullName).toBe('Updated Name');
    expect(found?.passwordHash).toBe('hash-2');
  });
});
