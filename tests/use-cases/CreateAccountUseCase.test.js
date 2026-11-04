"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const decimal_js_1 = require("decimal.js");
const CreateAccountUseCase_1 = require("../../src/use-cases/CreateAccountUseCase");
const User_1 = require("../../src/domain/entities/User");
const FinancialError_1 = require("../../src/domain/exceptions/FinancialError");
(0, vitest_1.describe)('CreateAccountUseCase', () => {
    let accountRepository;
    let userRepository;
    let useCase;
    const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const owner = User_1.User.create({
        id: userId,
        email: 'owner@bank.test',
        passwordHash: 'hash',
        fullName: 'Owner Test',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
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
        userRepository = {
            save: vitest_1.vi.fn(),
            findById: vitest_1.vi.fn(),
            findByEmail: vitest_1.vi.fn(),
        };
        useCase = new CreateAccountUseCase_1.CreateAccountUseCase(accountRepository, userRepository);
    });
    (0, vitest_1.it)('Creación Exitosa con Balance', async () => {
        vitest_1.vi.mocked(userRepository.findById).mockResolvedValue(owner);
        vitest_1.vi.mocked(accountRepository.save).mockImplementation(async (account) => account);
        const result = await useCase.execute({
            userId,
            initialBalance: 250,
        });
        (0, vitest_1.expect)(accountRepository.save).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(result.userId).toBe(userId);
        (0, vitest_1.expect)(result.status).toBe('ACTIVE');
        (0, vitest_1.expect)(result.balance.equals(new decimal_js_1.Decimal(250))).toBe(true);
        (0, vitest_1.expect)(result.accountNumber).toMatch(/^ACC-\d{9}$/);
        (0, vitest_1.expect)(result.id).toBeDefined();
    });
    (0, vitest_1.it)('Creación Exitosa Sin Balance', async () => {
        vitest_1.vi.mocked(userRepository.findById).mockResolvedValue(owner);
        vitest_1.vi.mocked(accountRepository.save).mockImplementation(async (account) => account);
        const result = await useCase.execute({ userId });
        (0, vitest_1.expect)(result.status).toBe('ACTIVE');
        (0, vitest_1.expect)(result.balance.equals(0)).toBe(true);
    });
    (0, vitest_1.it)('Monto Negativo', async () => {
        await (0, vitest_1.expect)(useCase.execute({ userId, initialBalance: -10 })).rejects.toBeInstanceOf(FinancialError_1.InvalidAmountError);
        (0, vitest_1.expect)(userRepository.findById).not.toHaveBeenCalled();
        (0, vitest_1.expect)(accountRepository.save).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=CreateAccountUseCase.test.js.map