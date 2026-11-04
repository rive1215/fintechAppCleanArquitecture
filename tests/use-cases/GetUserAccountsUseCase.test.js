"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const GetUserAccountsUseCase_1 = require("../../src/use-cases/GetUserAccountsUseCase");
const Account_1 = require("../../src/domain/entities/Account");
(0, vitest_1.describe)('GetUserAccountsUseCase', () => {
    let accountRepository;
    let useCase;
    const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
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
        useCase = new GetUserAccountsUseCase_1.GetUserAccountsUseCase(accountRepository);
    });
    (0, vitest_1.it)('Lista Cuentas del Usuario', async () => {
        const accounts = [
            Account_1.Account.create({
                id: 'acc-1',
                accountNumber: 'ACC-1',
                balance: new decimal_js_1.Decimal(100),
                userId,
                status: 'ACTIVE',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            }),
            Account_1.Account.create({
                id: 'acc-2',
                accountNumber: 'ACC-2',
                balance: new decimal_js_1.Decimal(50),
                userId,
                status: 'FROZEN',
                createdAt: new Date('2026-01-02T00:00:00.000Z'),
            }),
        ];
        vitest_1.vi.mocked(accountRepository.findByUserId).mockResolvedValue(accounts);
        const result = await useCase.execute(userId);
        (0, vitest_1.expect)(accountRepository.findByUserId).toHaveBeenCalledWith(userId);
        (0, vitest_1.expect)(result).toHaveLength(2);
        (0, vitest_1.expect)(result[0]?.id).toBe('acc-1');
        (0, vitest_1.expect)(result[1]?.status).toBe('FROZEN');
    });
    (0, vitest_1.it)('Usuario Sin Cuentas', async () => {
        vitest_1.vi.mocked(accountRepository.findByUserId).mockResolvedValue([]);
        const result = await useCase.execute(userId);
        (0, vitest_1.expect)(result).toEqual([]);
    });
});
//# sourceMappingURL=GetUserAccountsUseCase.test.js.map