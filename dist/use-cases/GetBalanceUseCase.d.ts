import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountOutputDTO, GetBalanceInputDTO } from "./dto/AccountDTOs";
/**
 * Caso de uso: consulta del saldo y datos de una cuenta.
 */
export declare class GetBalanceUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(input: GetBalanceInputDTO): Promise<AccountOutputDTO>;
}
//# sourceMappingURL=GetBalanceUseCase.d.ts.map