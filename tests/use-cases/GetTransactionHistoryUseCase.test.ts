import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { GetTransactionHistoryUseCase } from '../../src/use-cases/GetTransactionHistoryUseCase';
import { TransactionRepository } from '../../src/domain/repositories/Repositories';
import { Deposit, Withdrawal } from '../../src/domain/entities/Transaction';

describe('GetTransactionHistoryUseCase', () => {
  let transactionRepository: TransactionRepository;
  let useCase: GetTransactionHistoryUseCase;

  const accountId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    transactionRepository = {
      findById: vi.fn(),
      findByAccountId: vi.fn(),
      save: vi.fn(),
    };
    useCase = new GetTransactionHistoryUseCase(transactionRepository);
  });

  it('Historial con depósitos y retiros', async () => {
    const deposit = Deposit.create({
      id: 'dep-1',
      amount: new Decimal(100),
      status: 'COMPLETED',
      description: 'Ingreso',
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      destinationAccountId: accountId,
    });
    const withdrawal = Withdrawal.create({
      id: 'wd-1',
      amount: new Decimal(40),
      status: 'COMPLETED',
      description: 'Retiro',
      createdAt: new Date('2026-03-02T10:00:00.000Z'),
      sourceAccountId: accountId,
    });

    vi.mocked(transactionRepository.findByAccountId).mockResolvedValue([withdrawal, deposit]);

    const result = await useCase.execute({ accountId });

    expect(result.accountId).toBe(accountId);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]).toMatchObject({
      id: 'wd-1',
      type: 'WITHDRAWAL',
      amount: 40,
      sourceAccountId: accountId,
    });
    expect(result.transactions[1]).toMatchObject({
      id: 'dep-1',
      type: 'DEPOSIT',
      amount: 100,
      destinationAccountId: accountId,
    });
  });

  it('Historial vacío', async () => {
    vi.mocked(transactionRepository.findByAccountId).mockResolvedValue([]);

    const result = await useCase.execute({ accountId });

    expect(result).toEqual({ accountId, transactions: [] });
  });
});
