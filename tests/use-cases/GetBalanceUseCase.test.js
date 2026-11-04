"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const GetBalanceUseCase_1 = require("../../src/use-cases/GetBalanceUseCase");
const Account_1 = require("../../src/domain/entities/Account");
const FinancialError_1 = require("../../src/domain/exceptions/FinancialError");
(0, vitest_1.describe)('GetBalanceUseCase', () => {
    let accountRepository;
    let useCase;
    const accountId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
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
        useCase = new GetBalanceUseCase_1.GetBalanceUseCase(accountRepository);
    });
    (0, vitest_1.it)('Cuenta Existe', async () => {
        const account = Account_1.Account.create({
            id: accountId,
            accountNumber: 'ACC-123456789',
            balance: new decimal_js_1.Decimal('1250.50'),
            userId: 'user-1',
            status: 'ACTIVE',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
        });
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(account);
        const result = await useCase.execute({ accountId });
        (0, vitest_1.expect)(accountRepository.findById).toHaveBeenCalledWith(accountId);
        (0, vitest_1.expect)(result).toEqual({
            id: accountId,
            accountNumber: 'ACC-123456789',
            balance: account.balance,
            status: 'ACTIVE',
            userId: 'user-1',
            createdAt: account.createdAt,
        });
    });
    (0, vitest_1.it)('Cuenta No Existe', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(null);
        await (0, vitest_1.expect)(useCase.execute({ accountId })).rejects.toBeInstanceOf(FinancialError_1.AccountNotFoundError);
    });
});
//# sourceMappingURL=GetBalanceUseCase.test.js.map