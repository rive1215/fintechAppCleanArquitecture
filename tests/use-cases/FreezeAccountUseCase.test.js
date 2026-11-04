"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const FreezeAccountUseCase_1 = require("../../src/use-cases/FreezeAccountUseCase");
const Account_1 = require("../../src/domain/entities/Account");
const DomainError_1 = require("../../src/domain/exceptions/DomainError");
function buildAccount(overrides) {
    return Account_1.Account.create({
        id: overrides.id,
        accountNumber: `ACC-${overrides.id}`,
        balance: new decimal_js_1.Decimal(100),
        userId: 'user-1',
        status: overrides.status ?? 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
}
(0, vitest_1.describe)('FreezeAccountUseCase', () => {
    let accountRepository;
    let useCase;
    const accountId = '55555555-5555-5555-5555-555555555555';
    (0, vitest_1.beforeEach)(() => {
        accountRepository = {
            findById: vitest_1.vi.fn(),
            findByAccountNumber: vitest_1.vi.fn(),
            findByUserId: vitest_1.vi.fn(),
            save: vitest_1.vi.fn(),
            executeTransaction: vitest_1.vi.fn(),
            freeze: vitest_1.vi.fn(async (account) => {
                account.freeze();
            }),
            unfreeze: vitest_1.vi.fn(),
        };
        useCase = new FreezeAccountUseCase_1.FreezeAccountUseCase(accountRepository);
    });
    (0, vitest_1.it)('Congelar Cuenta Activa', async () => {
        const account = buildAccount({ id: accountId, status: 'ACTIVE' });
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(account);
        const result = await useCase.execute({ accountId });
        (0, vitest_1.expect)(accountRepository.freeze).toHaveBeenCalledWith(account);
        (0, vitest_1.expect)(result.status).toBe('FROZEN');
        (0, vitest_1.expect)(result.id).toBe(accountId);
    });
    (0, vitest_1.it)('Congelar Cuenta Congelada', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(buildAccount({ id: accountId, status: 'FROZEN' }));
        await (0, vitest_1.expect)(useCase.execute({ accountId })).rejects.toBeInstanceOf(DomainError_1.InvalidPropValueError);
        (0, vitest_1.expect)(accountRepository.freeze).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=FreezeAccountUseCase.test.js.map