import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountOutputDTO } from "./dto/AccountDTOs";
/**
 * Caso de uso: listar las cuentas pertenecientes a un usuario autenticado.
 */
export declare class GetUserAccountsUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(userId: string): Promise<AccountOutputDTO[]>;
}
//# sourceMappingURL=GetUserAccountsUseCase.d.ts.map