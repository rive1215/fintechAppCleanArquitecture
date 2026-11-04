import { PrismaClient } from '../../generated/prisma/client';
import { TransactionRepository } from '../../domain/repositories/Repositories';
import { Transaction } from '../../domain/entities/Transaction';
export declare class PrismaTransactionRepository implements TransactionRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    save(transaction: Transaction): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    /**
     * Historial de una cuenta: depósitos, retiros y transferencias donde participa
     * como origen o destino, ordenado del más reciente al más antiguo.
     */
    findByAccountId(accountId: string): Promise<Transaction[]>;
}
//# sourceMappingURL=PrismaTransactionRepository.d.ts.map