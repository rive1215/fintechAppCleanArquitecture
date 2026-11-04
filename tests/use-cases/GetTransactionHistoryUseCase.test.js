"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const GetTransactionHistoryUseCase_1 = require("../../src/use-cases/GetTransactionHistoryUseCase");
const Transaction_1 = require("../../src/domain/entities/Transaction");
(0, vitest_1.describe)('GetTransactionHistoryUseCase', () => {
    let transactionRepository;
    let useCase;
    const accountId = '33333333-3333-3333-3333-333333333333';
    (0, vitest_1.beforeEach)(() => {
        transactionRepository = {
            findById: vitest_1.vi.fn(),
            findByAccountId: vitest_1.vi.fn(),
            save: vitest_1.vi.fn(),
        };
        useCase = new GetTransactionHistoryUseCase_1.GetTransactionHistoryUseCase(transactionRepository);
    });
    (0, vitest_1.it)('Historial con depósitos y retiros', async () => {
        const deposit = Transaction_1.Deposit.create({
            id: 'dep-1',
            amount: new decimal_js_1.Decimal(100),
            status: 'COMPLETED',
            description: 'Ingreso',
            createdAt: new Date('2026-03-01T10:00:00.000Z'),
            destinationAccountId: accountId,
        });
        const withdrawal = Transaction_1.Withdrawal.create({
            id: 'wd-1',
            amount: new decimal_js_1.Decimal(40),
            status: 'COMPLETED',
            description: 'Retiro',
            createdAt: new Date('2026-03-02T10:00:00.000Z'),
            sourceAccountId: accountId,
        });
        vitest_1.vi.mocked(transactionRepository.findByAccountId).mockResolvedValue([withdrawal, deposit]);
        const result = await useCase.execute({ accountId });
        (0, vitest_1.expect)(result.accountId).toBe(accountId);
        (0, vitest_1.expect)(result.transactions).toHaveLength(2);
        (0, vitest_1.expect)(result.transactions[0]).toMatchObject({
            id: 'wd-1',
            type: 'WITHDRAWAL',
            amount: 40,
            sourceAccountId: accountId,
        });
        (0, vitest_1.expect)(result.transactions[1]).toMatchObject({
            id: 'dep-1',
            type: 'DEPOSIT',
            amount: 100,
            destinationAccountId: accountId,
        });
    });
    (0, vitest_1.it)('Historial vacío', async () => {
        vitest_1.vi.mocked(transactionRepository.findByAccountId).mockResolvedValue([]);
        const result = await useCase.execute({ accountId });
        (0, vitest_1.expect)(result).toEqual({ accountId, transactions: [] });
    });
});
//# sourceMappingURL=GetTransactionHistoryUseCase.test.js.map