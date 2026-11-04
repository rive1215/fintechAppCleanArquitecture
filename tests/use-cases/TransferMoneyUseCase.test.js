"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const TransferMoneyUseCase_1 = require("../../src/use-cases/TransferMoneyUseCase");
const Account_1 = require("../../src/domain/entities/Account");
const Transaction_1 = require("../../src/domain/entities/Transaction");
const FinancialError_1 = require("../../src/domain/exceptions/FinancialError");
const DomainError_1 = require("../../src/domain/exceptions/DomainError");
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
(0, vitest_1.describe)('TransferMoneyUseCase', () => {
    let accountRepository;
    let useCase;
    const sourceId = '11111111-1111-1111-1111-111111111111';
    const destinationId = '22222222-2222-2222-2222-222222222222';
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
        useCase = new TransferMoneyUseCase_1.TransferMoneyUseCase(accountRepository);
    });
    (0, vitest_1.it)('transfiere dinero cuando las cuentas son válidas y hay saldo', async () => {
        const source = buildAccount({ id: sourceId, balance: 500 });
        const destination = buildAccount({ id: destinationId, balance: 100 });
        const persistedTransfer = Transaction_1.Transfer.create({
            id: 'tx-1',
            amount: new decimal_js_1.Decimal(150),
            status: 'COMPLETED',
            description: 'ok',
            createdAt: new Date('2026-02-01T12:00:00.000Z'),
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
        });
        vitest_1.vi.mocked(accountRepository.findById)
            .mockResolvedValueOnce(source)
            .mockResolvedValueOnce(destination);
        vitest_1.vi.mocked(accountRepository.executeTransaction).mockResolvedValue(persistedTransfer);
        const result = await useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 150,
        });
        (0, vitest_1.expect)(accountRepository.executeTransaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(result).toEqual({
            transactionId: 'tx-1',
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 150,
            executedAt: persistedTransfer.createdAt,
        });
    });
    (0, vitest_1.it)('rechaza montos no positivos', async () => {
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 0,
        })).rejects.toBeInstanceOf(FinancialError_1.InvalidAmountError);
        (0, vitest_1.expect)(accountRepository.findById).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('rechaza transferencias a la misma cuenta', async () => {
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: sourceId,
            amount: 10,
        })).rejects.toBeInstanceOf(DomainError_1.InvalidPropValueError);
    });
    (0, vitest_1.it)('falla si la cuenta origen no existe', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValueOnce(null);
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 10,
        })).rejects.toBeInstanceOf(FinancialError_1.AccountNotFoundError);
    });
    (0, vitest_1.it)('falla si la cuenta origen está congelada', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValueOnce(buildAccount({ id: sourceId, balance: 500, status: 'FROZEN' }));
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 10,
        })).rejects.toBeInstanceOf(FinancialError_1.AccountFrozenError);
    });
    (0, vitest_1.it)('falla si el saldo es insuficiente', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValueOnce(buildAccount({ id: sourceId, balance: 5 }));
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 10,
        })).rejects.toBeInstanceOf(FinancialError_1.InsufficientBalanceError);
    });
    (0, vitest_1.it)('falla si la cuenta destino no existe', async () => {
        vitest_1.vi.mocked(accountRepository.findById)
            .mockResolvedValueOnce(buildAccount({ id: sourceId, balance: 500 }))
            .mockResolvedValueOnce(null);
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 10,
        })).rejects.toBeInstanceOf(FinancialError_1.AccountNotFoundError);
    });
    (0, vitest_1.it)('falla si la cuenta destino está congelada', async () => {
        vitest_1.vi.mocked(accountRepository.findById)
            .mockResolvedValueOnce(buildAccount({ id: sourceId, balance: 500 }))
            .mockResolvedValueOnce(buildAccount({ id: destinationId, balance: 100, status: 'FROZEN' }));
        await (0, vitest_1.expect)(useCase.execute({
            sourceAccountId: sourceId,
            destinationAccountId: destinationId,
            amount: 10,
        })).rejects.toBeInstanceOf(FinancialError_1.AccountFrozenError);
        (0, vitest_1.expect)(accountRepository.executeTransaction).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=TransferMoneyUseCase.test.js.map