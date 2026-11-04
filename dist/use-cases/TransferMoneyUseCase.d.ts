import { AccountRepository } from "../domain/repositories/Repositories";
import { TransferMoneyInputDTO, TransferMoneyOutputDTO } from "./dto/TransferDTOs";
/**
 * Caso de uso: transferencia de fondos entre dos cuentas.
 * Las invariantes de negocio se validan aquí; la atomicidad de persistencia
 * se delega a AccountRepository.executeTransaction (prisma.$transaction).
 */
export declare class TransferMoneyUseCase {
    private readonly accountRepository;
    constructor(accountRepository: AccountRepository);
    execute(input: TransferMoneyInputDTO): Promise<TransferMoneyOutputDTO>;
}
//# sourceMappingURL=TransferMoneyUseCase.d.ts.map