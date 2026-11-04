import { TransactionRepository } from "../domain/repositories/Repositories";
import { GetTransactionHistoryInputDTO, GetTransactionHistoryOutputDTO } from "./dto/TransactionHistoryDTOs";
export declare class GetTransactionHistoryUseCase {
    private readonly transactionRepository;
    constructor(transactionRepository: TransactionRepository);
    execute(input: GetTransactionHistoryInputDTO): Promise<GetTransactionHistoryOutputDTO>;
    private toHistoryItem;
}
//# sourceMappingURL=GetTransactionHistoryUseCase.d.ts.map