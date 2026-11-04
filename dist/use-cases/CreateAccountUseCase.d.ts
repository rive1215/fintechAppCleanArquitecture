import { AccountRepository, UserRepository } from "../domain/repositories/Repositories";
import { CreateAccountInputDTO, AccountOutputDTO } from "./dto/AccountDTOs";
/**
 * Caso de uso: apertura de una nueva cuenta bancaria para un usuario existente.
 */
export declare class CreateAccountUseCase {
    private readonly accountRepository;
    private readonly userRepository;
    constructor(accountRepository: AccountRepository, userRepository: UserRepository);
    execute(input: CreateAccountInputDTO): Promise<AccountOutputDTO>;
}
//# sourceMappingURL=CreateAccountUseCase.d.ts.map