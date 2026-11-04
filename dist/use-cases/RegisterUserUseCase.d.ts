import { UserRepository } from "../domain/repositories/Repositories";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { RegisterUserInputDTO, RegisterUserOutputDTO } from "./dto/AuthDTOs";
/**
 * Caso de uso: registro de un nuevo usuario autenticable.
 */
export declare class RegisterUserUseCase {
    private readonly userRepository;
    private readonly passwordHasher;
    constructor(userRepository: UserRepository, passwordHasher: PasswordHasher);
    execute(input: RegisterUserInputDTO): Promise<RegisterUserOutputDTO>;
}
//# sourceMappingURL=RegisterUserUseCase.d.ts.map