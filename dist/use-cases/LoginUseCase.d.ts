import { UserRepository } from "../domain/repositories/Repositories";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { TokenService } from "../domain/services/TokenService";
import { LoginInputDTO, LoginOutputDTO } from "./dto/AuthDTOs";
/**
 * Caso de uso: autenticación por email/password y emisión de JWT.
 */
export declare class LoginUseCase {
    private readonly userRepository;
    private readonly tokenService;
    private readonly passwordHasher;
    constructor(userRepository: UserRepository, tokenService: TokenService, passwordHasher: PasswordHasher);
    execute(input: LoginInputDTO): Promise<LoginOutputDTO>;
}
//# sourceMappingURL=LoginUseCase.d.ts.map