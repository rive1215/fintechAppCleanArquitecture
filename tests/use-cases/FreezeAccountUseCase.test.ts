import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { FreezeAccountUseCase } from '../../src/use-cases/FreezeAccountUseCase';
import { AccountRepository } from '../../src/domain/repositories/Repositories';
import { Account } from '../../src/domain/entities/Account';
import { InvalidPropValueError } from '../../src/domain/exceptions/DomainError';

function buildAccount(overrides: {
  id: string;
  status?: 'ACTIVE' | 'FROZEN';
}): Account {
  return Account.create({
    id: overrides.id,
    accountNumber: `ACC-${overrides.id}`,
    balance: new Decimal(100),
    userId: 'user-1',
    status: overrides.status ?? 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

describe('FreezeAccountUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: FreezeAccountUseCase;

  const accountId = '55555555-5555-5555-5555-555555555555';

  beforeEach(() => {
    accountRepository = {
      findById: vi.fn(),
      findByAccountNumber: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      executeTransaction: vi.fn(),
      freeze: vi.fn(async (account: Account) => {
        account.freeze();
      }),
      unfreeze: vi.fn(),
    };

    useCase = new FreezeAccountUseCase(accountRepository);
  });

  it('Congelar Cuenta Activa', async () => {
    const account = buildAccount({ id: accountId, status: 'ACTIVE' });
    vi.mocked(accountRepository.findById).mockResolvedValue(account);

    const result = await useCase.execute({ accountId });

    expect(accountRepository.freeze).toHaveBeenCalledWith(account);
    expect(result.status).toBe('FROZEN');
    expect(result.id).toBe(accountId);
  });

  it('Congelar Cuenta Congelada', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(
      buildAccount({ id: accountId, status: 'FROZEN' }),
    );

    await expect(
      useCase.execute({ accountId }),
    ).rejects.toBeInstanceOf(InvalidPropValueError);

    expect(accountRepository.freeze).not.toHaveBeenCalled();
  });
});
