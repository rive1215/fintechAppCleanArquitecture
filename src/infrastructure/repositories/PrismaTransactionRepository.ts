import { PrismaClient } from '../../generated/prisma/client';
import { TransactionRepository } from '../../domain/repositories/Repositories';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async save(transaction: Transaction): Promise<Transaction> {
    const data = TransactionMapper.toPersistence(transaction);

    // Sin id: alta nueva (la DB genera el UUID)
    if (transaction.id === undefined) {
      const created = await this.prisma.transaction.create({ data });
      return TransactionMapper.toDomain(created);
    }

    // Con id: upsert (insertar si no existe; actualizar estado/descripción si ya existe)
    const prismaTransaction = await this.prisma.transaction.upsert({
      where: { id: transaction.id },
      update: {
        status: transaction.status,
        description: transaction.description,
      },
      create: data,
    });

    return TransactionMapper.toDomain(prismaTransaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const prismaTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!prismaTransaction) return null;

    return TransactionMapper.toDomain(prismaTransaction);
  }

  /**
   * Historial de una cuenta: depósitos, retiros y transferencias donde participa
   * como origen o destino, ordenado del más reciente al más antiguo.
   */
  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const prismaTransactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { sourceAccountId: accountId },
          { destinationAccountId: accountId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaTransactions.map(TransactionMapper.toDomain);
  }
}
