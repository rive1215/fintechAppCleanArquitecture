import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { TransferMoneyUseCase } from '../../src/use-cases/TransferMoneyUseCase';
import { AccountRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';
import { Transfer } from '../../src/domain/entities/Transaction';
import {
  AccountNotFoundError,
  AccountFrozenError,
  InsufficientBalanceError,
  InvalidAmountError,
} from '../../src/domain/exceptions/FinancialError';
import { InvalidPropValueError } from '../../src/domain/exceptions/DomainError';

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

describe('TransferMoneyUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: TransferMoneyUseCase;

  const sourceId = '11111111-1111-1111-1111-111111111111';
  const destinationId = '22222222-2222-2222-2222-222222222222';

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

    useCase = new TransferMoneyUseCase(accountRepository);
  });

  it('transfiere dinero cuando las cuentas son válidas y hay saldo', async () => {
    const source = buildAccount({ id: sourceId, balance: 500 });
    const destination = buildAccount({ id: destinationId, balance: 100 });
    const persistedTransfer = Transfer.create({
      id: 'tx-1',
      amount: new Decimal(150),
      status: 'COMPLETED',
      description: 'ok',
      createdAt: new Date('2026-02-01T12:00:00.000Z'),
      sourceAccountId: sourceId,
      destinationAccountId: destinationId,
    });

    vi.mocked(accountRepository.findById)
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(destination);
    vi.mocked(accountRepository.executeTransaction).mockResolvedValue(persistedTransfer);

    const result = await useCase.execute({
      sourceAccountId: sourceId,
      destinationAccountId: destinationId,
      amount: 150,
    });

    expect(accountRepository.executeTransaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      transactionId: 'tx-1',
      sourceAccountId: sourceId,
      destinationAccountId: destinationId,
      amount: 150,
      executedAt: persistedTransfer.createdAt,
    });
  });

  it('rechaza montos no positivos', async () => {
    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidAmountError);

    expect(accountRepository.findById).not.toHaveBeenCalled();
  });

  it('rechaza transferencias a la misma cuenta', async () => {
    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: sourceId,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(InvalidPropValueError);
  });

  it('falla si la cuenta origen no existe', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);
  });

  it('falla si la cuenta origen está congelada', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValueOnce(
      buildAccount({ id: sourceId, balance: 500, status: 'FROZEN' }),
    );

    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(AccountFrozenError);
  });

  it('falla si el saldo es insuficiente', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValueOnce(
      buildAccount({ id: sourceId, balance: 5 }),
    );

    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(InsufficientBalanceError);
  });

  it('falla si la cuenta destino no existe', async () => {
    vi.mocked(accountRepository.findById)
      .mockResolvedValueOnce(buildAccount({ id: sourceId, balance: 500 }))
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);
  });

  it('falla si la cuenta destino está congelada', async () => {
    vi.mocked(accountRepository.findById)
      .mockResolvedValueOnce(buildAccount({ id: sourceId, balance: 500 }))
      .mockResolvedValueOnce(buildAccount({ id: destinationId, balance: 100, status: 'FROZEN' }));

    await expect(
      useCase.execute({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(AccountFrozenError);

    expect(accountRepository.executeTransaction).not.toHaveBeenCalled();
  });
});
