import { AccountRepository } from "../domain/repositories/Repositories";
import { DepositFundsInputDTO, DepositFundsOutputDTO } from "./dto/FundMovementDTOs";
/**
 * RF-3.1 — Ingreso de fondos (DEPOSIT).
 * Valida monto > 0 y cuenta activa; acredita saldo vía executeTransaction.
 */
export declare class DepositUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(input: DepositFundsInputDTO): Promise<DepositFundsOutputDTO>;
}
//# sourceMappingURL=DepositUseCase.d.ts.map