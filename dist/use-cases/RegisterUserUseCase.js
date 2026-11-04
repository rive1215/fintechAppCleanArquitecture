"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const User_1 = require("../domain/entities/User");
const UserError_1 = require("../domain/exceptions/UserError");
/**
 * Caso de uso: registro de un nuevo usuario autenticable.
 */
class RegisterUserUseCase {
    userRepository;
    passwordHasher;
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(input) {
        const existing = await this.userRepository.findByEmail(input.email);
        if (existing) {
            throw new UserError_1.UserAlreadyExistsError(input.email);
        }
        const passwordHash = await this.passwordHasher.hash(input.password);
        const user = User_1.User.create({
            id: crypto.randomUUID(),
            email: input.email,
            passwordHash,
            fullName: input.name,
            createdAt: new Date(),
        });
        const saved = await this.userRepository.save(user);
        return {
            id: saved.id,
            email: saved.email,
            fullName: saved.fullName,
            createdAt: saved.createdAt,
        };
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
//# sourceMappingURL=RegisterUserUseCase.js.map