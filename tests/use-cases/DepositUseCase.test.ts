import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { DepositUseCase } from '../../src/use-cases/DepositUseCase';
import { AccountRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';
import { Deposit } from '../../src/domain/entities/Transaction';
import {
  AccountNotFoundError,
  AccountFrozenError,
  InvalidAmountError,
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

describe('DepositUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: DepositUseCase;

  const accountId = '33333333-3333-3333-3333-333333333333';

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

    useCase = new DepositUseCase(accountRepository);
  });

  it('Depósito Exitoso', async () => {
    const account = buildAccount({ id: accountId, balance: 100 });
    const persisted = Deposit.create({
      id: 'dep-1',
      amount: new Decimal(50),
      status: 'COMPLETED',
      description: 'ok',
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      destinationAccountId: accountId,
    });

    vi.mocked(accountRepository.findById).mockResolvedValue(account);
    vi.mocked(accountRepository.executeTransaction).mockResolvedValue(persisted);

    const result = await useCase.execute({ accountId, amount: 50 });

    expect(accountRepository.executeTransaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      transactionId: 'dep-1',
      accountId,
      amount: 50,
      type: 'DEPOSIT',
      executedAt: persisted.createdAt,
    });
  });

  it('Monto Negativo', async () => {
    await expect(
      useCase.execute({ accountId, amount: -25 }),
    ).rejects.toBeInstanceOf(InvalidAmountError);

    expect(accountRepository.findById).not.toHaveBeenCalled();
    expect(accountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it('Cuenta No Existe', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ accountId, amount: 10 }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);

    expect(accountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it('Cuenta Congelada', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(
      buildAccount({ id: accountId, balance: 100, status: 'FROZEN' }),
    );

    await expect(
      useCase.execute({ accountId, amount: 10 }),
    ).rejects.toBeInstanceOf(AccountFrozenError);

    expect(accountRepository.executeTransaction).not.toHaveBeenCalled();
  });
});
