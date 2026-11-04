"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const UnfreezeAccountUseCase_1 = require("../../src/use-cases/UnfreezeAccountUseCase");
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
(0, vitest_1.describe)('UnfreezeAccountUseCase', () => {
    let accountRepository;
    let useCase;
    const accountId = '66666666-6666-6666-6666-666666666666';
    (0, vitest_1.beforeEach)(() => {
        accountRepository = {
            findById: vitest_1.vi.fn(),
            findByAccountNumber: vitest_1.vi.fn(),
            findByUserId: vitest_1.vi.fn(),
            save: vitest_1.vi.fn(),
            executeTransaction: vitest_1.vi.fn(),
            freeze: vitest_1.vi.fn(),
            unfreeze: vitest_1.vi.fn(async (account) => {
                account.unfreeze();
            }),
        };
        useCase = new UnfreezeAccountUseCase_1.UnfreezeAccountUseCase(accountRepository);
    });
    (0, vitest_1.it)('Descongelar Cuenta Congelada', async () => {
        const account = buildAccount({ id: accountId, status: 'FROZEN' });
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(account);
        const result = await useCase.execute({ accountId });
        (0, vitest_1.expect)(accountRepository.unfreeze).toHaveBeenCalledWith(account);
        (0, vitest_1.expect)(result.status).toBe('ACTIVE');
        (0, vitest_1.expect)(result.id).toBe(accountId);
    });
    (0, vitest_1.it)('Descongelar Cuenta Activa', async () => {
        vitest_1.vi.mocked(accountRepository.findById).mockResolvedValue(buildAccount({ id: accountId, status: 'ACTIVE' }));
        await (0, vitest_1.expect)(useCase.execute({ accountId })).rejects.toBeInstanceOf(DomainError_1.InvalidPropValueError);
        (0, vitest_1.expect)(accountRepository.unfreeze).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=UnfreezeAccountUseCase.test.js.map