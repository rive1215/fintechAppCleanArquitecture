"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const UserError_1 = require("../domain/exceptions/UserError");
/**
 * Caso de uso: autenticación por email/password y emisión de JWT.
 */
class LoginUseCase {
    userRepository;
    tokenService;
    passwordHasher;
    constructor(userRepository, tokenService, passwordHasher) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordHasher = passwordHasher;
    }
    async execute(input) {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            throw new UserError_1.InvalidCredentialsError();
        }
        const credentialsMatch = await this.passwordHasher.compare(input.password, user.passwordHash);
        if (!credentialsMatch) {
            throw new UserError_1.InvalidCredentialsError();
        }
        const accessToken = this.tokenService.generateToken({
            userId: user.id,
            email: user.email,
        });
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        };
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=LoginUseCase.js.map