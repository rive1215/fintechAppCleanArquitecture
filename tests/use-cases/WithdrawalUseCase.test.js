"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const WithdrawalUseCase_1 = require("../../src/use-cases/WithdrawalUseCase");
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
(0, vitest_1.describe)('WithdrawalUseCase', () => {
    let accountRepository;
    let useCase;
    const accountId = '44444444-4444-4444-4444-444444444444';
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
        useCase = new WithdrawalUseCase_1.WithdrawalUseCase(accountRepository);
    });
    (0, vitest_1.it)('Retiro Exitoso', async () => {
        const account = buildAccount({ id: accountId, balance: 200 });
        const persisted = Transaction_1.Withdrawal.create({
            id: 'wd-1',
            amount: new decimal_js_1.Decimal(75),
            status: 'COMPLETED',
            description: 'ok',
            createdAt: new Date('2026-03-01T11:00:00.000Z'),
            sourceAccountId: accountId,
        });
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(account);
        vitest_1.vi.mocked(accountRepository.executeTransaction).mockResolvedValue(persisted);
        const result = await useCase.execute({ accountId, amount: 75 });
        (0, vitest_1.expect)(accountRepository.executeTransaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(result).toEqual({
            transactionId: 'wd-1',
            accountId,
            amount: 75,
            type: 'WITHDRAWAL',
            executedAt: persisted.createdAt,
        });
    });
    (0, vitest_1.it)('Saldo Insuficiente', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(buildAccount({ id: accountId, balance: 20 }));
        await (0, vitest_1.expect)(useCase.execute({ accountId, amount: 50 })).rejects.toBeInstanceOf(FinancialError_1.InsufficientBalanceError);
        (0, vitest_1.expect)(accountRepository.executeTransaction).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('Cuenta Congelada', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(buildAccount({ id: accountId, balance: 200, status: 'FROZEN' }));
        await (0, vitest_1.expect)(useCase.execute({ accountId, amount: 10 })).rejects.toBeInstanceOf(FinancialError_1.AccountFrozenError);
        (0, vitest_1.expect)(accountRepository.executeTransaction).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=WithdrawalUseCase.test.js.map