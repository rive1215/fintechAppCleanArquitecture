"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const LoginUseCase_1 = require("../../src/use-cases/LoginUseCase");
const User_1 = require("../../src/domain/entities/User");
const UserError_1 = require("../../src/domain/exceptions/UserError");
(0, vitest_1.describe)('LoginUseCase', () => {
    let userRepository;
    let passwordHasher;
    let tokenService;
    let useCase;
    const user = User_1.User.create({
        id: 'user-1',
        email: 'ana@bank.test',
        passwordHash: 'hashed-password',
        fullName: 'Ana Pérez',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
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
        tokenService = {
            generateToken: vitest_1.vi.fn(),
            verifyToken: vitest_1.vi.fn(),
        };
        useCase = new LoginUseCase_1.LoginUseCase(userRepository, tokenService, passwordHasher);
    });
    (0, vitest_1.it)('Login Exitoso', async () => {
        vitest_1.vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
        vitest_1.vi.mocked(passwordHasher.compare).mockResolvedValue(true);
        vitest_1.vi.mocked(tokenService.generateToken).mockReturnValue('jwt-token');
        const result = await useCase.execute({
            email: 'ana@bank.test',
            password: 'password123',
        });
        (0, vitest_1.expect)(tokenService.generateToken).toHaveBeenCalledWith({
            userId: 'user-1',
            email: 'ana@bank.test',
        });
        (0, vitest_1.expect)(result).toEqual({
            accessToken: 'jwt-token',
            user: {
                id: 'user-1',
                email: 'ana@bank.test',
                fullName: 'Ana Pérez',
            },
        });
    });
    (0, vitest_1.it)('Credenciales Inválidas - usuario inexistente', async () => {
        vitest_1.vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
        await (0, vitest_1.expect)(useCase.execute({ email: 'missing@bank.test', password: 'x' })).rejects.toBeInstanceOf(UserError_1.InvalidCredentialsError);
    });
    (0, vitest_1.it)('Credenciales Inválidas - password incorrecto', async () => {
        vitest_1.vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
        vitest_1.vi.mocked(passwordHasher.compare).mockResolvedValue(false);
        await (0, vitest_1.expect)(useCase.execute({ email: 'ana@bank.test', password: 'wrong' })).rejects.toBeInstanceOf(UserError_1.InvalidCredentialsError);
        (0, vitest_1.expect)(tokenService.generateToken).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=LoginUseCase.test.js.map