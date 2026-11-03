import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { WithdrawalUseCase } from '../../src/use-cases/WithdrawalUseCase';
import { AccountRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';
import { Withdrawal } from '../../src/domain/entities/Transaction';
import {
  AccountFrozenError,
  InsufficientBalanceError,
} from '../../src/domain/exceptions/FinancialError';

function buildAccount(overrides: {
  id: string;
  balance: number;
  status?: 'ACTIVE' | 'FROZEN';
}): Account {
  return Account.create({
    id: overrides.id,
    accountNumber: `ACC-${overrides.id}`,
    balance: new Decimal(overrides.balance),
    userId: 'user-1',
    status: overrides.status ?? 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

describe('WithdrawalUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: WithdrawalUseCase;

  const accountId = '44444444-4444-4444-4444-444444444444';

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

    useCase = new WithdrawalUseCase(accountRepository);
  });

  it('Retiro Exitoso', async () => {
    const account = buildAccount({ id: accountId, balance: 200 });
    const persisted = Withdrawal.create({
      id: 'wd-1',
      amount: new Decimal(75),
      status: 'COMPLETED',
      description: 'ok',
      createdAt: new Date('2026-03-01T11:00:00.000Z'),
      sourceAccountId: accountId,
    });

    vi.mocked(accountRepository.findById).mockResolvedValue(account);
    vi.mocked(accountRepository.executeTransaction).mockResolvedValue(persisted);

    const result = await useCase.execute({ accountId, amount: 75 });

    expect(accountRepository.executeTransaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      transactionId: 'wd-1',
      accountId,
      amount: 75,
      type: 'WITHDRAWAL',
      executedAt: persisted.createdAt,
    });
  });

  it('Saldo Insuficiente', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(
      buildAccount({ id: accountId, balance: 20 }),
    );

    await expect(
      useCase.execute({ accountId, amount: 50 }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);

    expect(accountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it('Cuenta Congelada', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(
      buildAccount({ id: accountId, balance: 200, status: 'FROZEN' }),
    );

    await expect(
      useCase.execute({ accountId, amount: 10 }),
    ).rejects.toBeInstanceOf(AccountFrozenError);

    expect(accountRepository.executeTransaction).not.toHaveBeenCalled();
  });
});
