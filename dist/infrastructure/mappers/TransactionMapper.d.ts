import { Transaction as PrismaTransaction, Prisma } from '../../generated/prisma/client';
import { Transaction } from '../../domain/entities/Transaction';
export declare class TransactionMapper {
    static toDomain(prismaTx: PrismaTransaction): Transaction;
    static toPersistence(transaction: Transaction): Prisma.TransactionUncheckedCreateInput;
}
//# sourceMappingURL=TransactionMapper.d.ts.map