import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { GetUserAccountsUseCase } from '../../src/use-cases/GetUserAccountsUseCase';
import { AccountRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';

describe('GetUserAccountsUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: GetUserAccountsUseCase;

  const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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
    useCase = new GetUserAccountsUseCase(accountRepository);
  });

  it('Lista Cuentas del Usuario', async () => {
    const accounts = [
      Account.create({
        id: 'acc-1',
        accountNumber: 'ACC-1',
        balance: new Decimal(100),
        userId,
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      Account.create({
        id: 'acc-2',
        accountNumber: 'ACC-2',
        balance: new Decimal(50),
        userId,
        status: 'FROZEN',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    ];

    vi.mocked(accountRepository.findByUserId).mockResolvedValue(accounts);

    const result = await useCase.execute(userId);

    expect(accountRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('acc-1');
    expect(result[1]?.status).toBe('FROZEN');
  });

  it('Usuario Sin Cuentas', async () => {
    vi.mocked(accountRepository.findByUserId).mockResolvedValue([]);

    const result = await useCase.execute(userId);

    expect(result).toEqual([]);
  });
});
