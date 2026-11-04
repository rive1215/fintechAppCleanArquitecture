import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountOutputDTO, UnfreezeAccountInputDTO } from "./dto/AccountDTOs";
/**
 * Descongela una cuenta FROZEN → ACTIVE.
 */
export declare class UnfreezeAccountUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(input: UnfreezeAccountInputDTO): Promise<AccountOutputDTO>;
}
//# sourceMappingURL=UnfreezeAccountUseCase.d.ts.map