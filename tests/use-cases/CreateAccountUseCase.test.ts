import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { CreateAccountUseCase } from '../../src/use-cases/CreateAccountUseCase';
import { AccountRepository, UserRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';
import { User } from '../../src/domain/entities/User';
import { InvalidAmountError } from '../../src/domain/exceptions/FinancialError';

describe('CreateAccountUseCase', () => {
  let accountRepository: AccountRepository;
  let userRepository: UserRepository;
  let useCase: CreateAccountUseCase;

  const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const owner = User.create({
    id: userId,
    email: 'owner@bank.test',
    passwordHash: 'hash',
    fullName: 'Owner Test',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    accountRepository = {
      findById: vi.fn(),
      findByAccountNumber: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      executeTransaction: vi.fn(),
      freeze: vi.fn(),
      unfreeze: vi.fn(),
    };

    userRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
    };

    useCase = new CreateAccountUseCase(accountRepository, userRepository);
  });

  it('Creación Exitosa con Balance', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(owner);
    vi.mocked(accountRepository.save).mockImplementation(async (account: Account) => account);

    const result = await useCase.execute({
      userId,
      initialBalance: 250,
    });

    expect(accountRepository.save).toHaveBeenCalledTimes(1);
    expect(result.userId).toBe(userId);
    expect(result.status).toBe('ACTIVE');
    expect(result.balance.equals(new Decimal(250))).toBe(true);
    expect(result.accountNumber).toMatch(/^ACC-\d{9}$/);
    expect(result.id).toBeDefined();
  });

  it('Creación Exitosa Sin Balance', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(owner);
    vi.mocked(accountRepository.save).mockImplementation(async (account: Account) => account);

    const result = await useCase.execute({ userId });

    expect(result.status).toBe('ACTIVE');
    expect(result.balance.equals(0)).toBe(true);
  });

  it('Monto Negativo', async () => {
    await expect(
      useCase.execute({ userId, initialBalance: -10 }),
    ).rejects.toBeInstanceOf(InvalidAmountError);

    expect(userRepository.findById).not.toHaveBeenCalled();
    expect(accountRepository.save).not.toHaveBeenCalled();
  });
});
