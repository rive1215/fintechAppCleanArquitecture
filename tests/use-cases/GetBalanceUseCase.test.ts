import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { GetBalanceUseCase } from '../../src/use-cases/GetBalanceUseCase';
import { AccountRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';
import { AccountNotFoundError } from '../../src/domain/exceptions/FinancialError';

describe('GetBalanceUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: GetBalanceUseCase;

  const accountId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

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

    useCase = new GetBalanceUseCase(accountRepository);
  });

  it('Cuenta Existe', async () => {
    const account = Account.create({
      id: accountId,
      accountNumber: 'ACC-123456789',
      balance: new Decimal('1250.50'),
      userId: 'user-1',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    vi.mocked(accountRepository.findById).mockResolvedValue(account);

    const result = await useCase.execute({ accountId });

    expect(accountRepository.findById).toHaveBeenCalledWith(accountId);
    expect(result).toEqual({
      id: accountId,
      accountNumber: 'ACC-123456789',
      balance: account.balance,
      status: 'ACTIVE',
      userId: 'user-1',
      createdAt: account.createdAt,
    });
  });

  it('Cuenta No Existe', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ accountId }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);
  });
});
