import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountOutputDTO, FreezeAccountInputDTO } from "./dto/AccountDTOs";
/**
 * Congela una cuenta ACTIVE → FROZEN.
 */
export declare class FreezeAccountUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(input: FreezeAccountInputDTO): Promise<AccountOutputDTO>;
}
//# sourceMappingURL=FreezeAccountUseCase.d.ts.map