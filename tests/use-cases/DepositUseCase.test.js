"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const DepositUseCase_1 = require("../../src/use-cases/DepositUseCase");
const Account_1 = require("../../src/domain/entities/Account");
const Transaction_1 = require("../../src/domain/entities/Transaction");
const FinancialError_1 = require("../../src/domain/exceptions/FinancialError");
function buildAccount(overrides) {
    return Account_1.Account.create({
        id: overrides.id,
        accountNumber: `ACC-${overrides.id}`,
        balance: new decimal_js_1.Decimal(overrides.balance),
        userId: 'user-1',
        status: overrides.status ?? 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
}
(0, vitest_1.describe)('DepositUseCase', () => {
    let accountRepository;
    let useCase;
    const accountId = '33333333-3333-3333-3333-333333333333';
    (0, vitest_1.beforeEach)(() => {
        accountRepository = {
            findById: vitest_1.vi.fn(),
            findByAccountNumber: vitest_1.vi.fn(),
            findByUserId: vitest_1.vi.fn(),
            save: vitest_1.vi.fn(),
            executeTransaction: vitest_1.vi.fn(),
            freeze: vitest_1.vi.fn(),
            unfreeze: vitest_1.vi.fn(),
        };
        useCase = new DepositUseCase_1.DepositUseCase(accountRepository);
    });
    (0, vitest_1.it)('Depósito Exitoso', async () => {
        const account = buildAccount({ id: accountId, balance: 100 });
        const persisted = Transaction_1.Deposit.create({
            id: 'dep-1',
            amount: new decimal_js_1.Decimal(50),
            status: 'COMPLETED',
            description: 'ok',
            createdAt: new Date('2026-03-01T10:00:00.000Z'),
            destinationAccountId: accountId,
        });
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(account);
        vitest_1.vi.mocked(accountRepository.executeTransaction).mockResolvedValue(persisted);
        const result = await useCase.execute({ accountId, amount: 50 });
        (0, vitest_1.expect)(accountRepository.executeTransaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(result).toEqual({
            transactionId: 'dep-1',
            accountId,
            amount: 50,
            type: 'DEPOSIT',
            executedAt: persisted.createdAt,
        });
    });
    (0, vitest_1.it)('Monto Negativo', async () => {
        await (0, vitest_1.expect)(useCase.execute({ accountId, amount: -25 })).rejects.toBeInstanceOf(FinancialError_1.InvalidAmountError);
        (0, vitest_1.expect)(accountRepository.findById).not.toHaveBeenCalled();
        (0, vitest_1.expect)(accountRepository.executeTransaction).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('Cuenta No Existe', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(null);
        await (0, vitest_1.expect)(useCase.execute({ accountId, amount: 10 })).rejects.toBeInstanceOf(FinancialError_1.AccountNotFoundError);
        (0, vitest_1.expect)(accountRepository.executeTransaction).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('Cuenta Congelada', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(buildAccount({ id: accountId, balance: 100, status: 'FROZEN' }));
        await (0, vitest_1.expect)(useCase.execute({ accountId, amount: 10 })).rejects.toBeInstanceOf(FinancialError_1.AccountFrozenError);
        (0, vitest_1.expect)(accountRepository.executeTransaction).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=DepositUseCase.test.js.map