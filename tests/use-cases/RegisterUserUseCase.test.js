"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const RegisterUserUseCase_1 = require("../../src/use-cases/RegisterUserUseCase");
const User_1 = require("../../src/domain/entities/User");
const UserError_1 = require("../../src/domain/exceptions/UserError");
(0, vitest_1.describe)('RegisterUserUseCase', () => {
    let userRepository;
    let passwordHasher;
    let useCase;
    (0, vitest_1.beforeEach)(() => {
        userRepository = {
            save: vitest_1.vi.fn(),
            findById: vitest_1.vi.fn(),
            findByEmail: vitest_1.vi.fn(),
        };
        passwordHasher = {
            hash: vitest_1.vi.fn(),
            compare: vitest_1.vi.fn(),
        };
        useCase = new RegisterUserUseCase_1.RegisterUserUseCase(userRepository, passwordHasher);
    });
    (0, vitest_1.it)('Registro Exitoso', async () => {
        vitest_1.vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
        vitest_1.vi.mocked(passwordHasher.hash).mockResolvedValue('hashed-password');
        vitest_1.vi.mocked(userRepository.save).mockImplementation(async (user) => user);
        const result = await useCase.execute({
            name: 'Ana Pérez',
            email: 'ana@bank.test',
            password: 'password123',
        });
        (0, vitest_1.expect)(passwordHasher.hash).toHaveBeenCalledWith('password123');
        (0, vitest_1.expect)(userRepository.save).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(result.email).toBe('ana@bank.test');
        (0, vitest_1.expect)(result.fullName).toBe('Ana Pérez');
        (0, vitest_1.expect)(result.id).toBeDefined();
    });
    (0, vitest_1.it)('Usuario Ya Existe', async () => {
        const existing = User_1.User.create({
            id: 'user-1',
            email: 'ana@bank.test',
            passwordHash: 'hash',
            fullName: 'Ana Pérez',
            createdAt: new Date(),
        });
        vitest_1.vi.mocked(userRepository.findByEmail).mockResolvedValue(existing);
        await (0, vitest_1.expect)(useCase.execute({
            name: 'Ana Pérez',
            email: 'ana@bank.test',
            password: 'password123',
        })).rejects.toBeInstanceOf(UserError_1.UserAlreadyExistsError);
        (0, vitest_1.expect)(passwordHasher.hash).not.toHaveBeenCalled();
        (0, vitest_1.expect)(userRepository.save).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=RegisterUserUseCase.test.js.map