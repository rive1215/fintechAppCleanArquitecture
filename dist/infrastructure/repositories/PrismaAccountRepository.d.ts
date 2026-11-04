import { PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/Repositories';
import { Account } from '../../domain/entities/Account';
import { Transaction } from '../../domain/entities/Transaction';
export declare class PrismaAccountRepository implements AccountRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    save(account: Account): Promise<Account>;
    findById(id: string): Promise<Account | null>;
    findByAccountNumber(accountNumber: string): Promise<Account | null>;
    findByUserId(userId: string): Promise<Account[]>;
    /**
     * Ejecuta Deposit / Withdrawal / Transfer de forma atómica con prisma.$transaction:
     * actualiza saldos vía métodos de dominio y persiste el registro STI de Transaction.
     * Si cualquier paso falla, Prisma hace rollback de toda la unidad de trabajo.
     */
    executeTransaction(transaction: Transaction): Promise<Transaction>;
    freeze(account: Account): Promise<void>;
    unfreeze(account: Account): Promise<void>;
    private executeDeposit;
    private executeWithdrawal;
    private executeTransfer;
}
//# sourceMappingURL=PrismaAccountRepository.d.ts.map