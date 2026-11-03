import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from 'decimal.js';
import { UnfreezeAccountUseCase } from '../../src/use-cases/UnfreezeAccountUseCase';
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

describe('UnfreezeAccountUseCase', () => {
  let accountRepository: AccountRepository;
  let useCase: UnfreezeAccountUseCase;

  const accountId = '66666666-6666-6666-6666-666666666666';

  beforeEach(() => {
    accountRepository = {
      findById: vi.fn(),
      findByAccountNumber: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      executeTransaction: vi.fn(),
      freeze: vi.fn(),
      unfreeze: vi.fn(async (account: Account) => {
        account.unfreeze();
      }),
    };

    useCase = new UnfreezeAccountUseCase(accountRepository);
  });

  it('Descongelar Cuenta Congelada', async () => {
    const account = buildAccount({ id: accountId, status: 'FROZEN' });
    vi.mocked(accountRepository.findById).mockResolvedValue(account);

    const result = await useCase.execute({ accountId });

    expect(accountRepository.unfreeze).toHaveBeenCalledWith(account);
    expect(result.status).toBe('ACTIVE');
    expect(result.id).toBe(accountId);
  });

  it('Descongelar Cuenta Activa', async () => {
    vi.mocked(accountRepository.findById).mockResolvedValue(
      buildAccount({ id: accountId, status: 'ACTIVE' }),
    );

    await expect(
      useCase.execute({ accountId }),
    ).rejects.toBeInstanceOf(InvalidPropValueError);

    expect(accountRepository.unfreeze).not.toHaveBeenCalled();
  });
});
