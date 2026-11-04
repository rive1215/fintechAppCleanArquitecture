import { AccountRepository } from "../domain/repositories/Repositories";
import { WithdrawalFundsInputDTO, WithdrawalFundsOutputDTO } from "./dto/FundMovementDTOs";
/**
 * RF-3.2 — Retiro de fondos (WITHDRAWAL).
 * Valida monto > 0, cuenta ACTIVE y saldo B ≥ amount; debita vía executeTransaction.
 */
export declare class WithdrawalUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(input: WithdrawalFundsInputDTO): Promise<WithdrawalFundsOutputDTO>;
}
//# sourceMappingURL=WithdrawalUseCase.d.ts.map