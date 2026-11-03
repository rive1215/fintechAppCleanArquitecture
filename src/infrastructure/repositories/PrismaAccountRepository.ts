import { PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/Repositories';
import { Account } from '../../domain/entities/Account';
import { Deposit, Transfer, Transaction, Withdrawal } from '../../domain/entities/Transaction';
import { AccountMapper } from '../mappers/AccountMapper';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaAccountRepository implements AccountRepository {
  // Inyección de dependencias a través del constructor
  constructor(private readonly prisma: PrismaClient) { }

  async save(account: Account): Promise<Account> {
    const data = AccountMapper.toPersistence(account);

    // Sin id: alta nueva (la DB genera el UUID)
    if (account.id === undefined) {
      const created = await this.prisma.account.create({ data });
      return AccountMapper.toDomain(created);
    }

    // Con id: upsert (insertar si no existe, actualizar si ya existe)
    const prismaAccount = await this.prisma.account.upsert({
      where: { id: account.id },
      update: {
        balance: account.balance,
        status: account.status,
      },
      create: data,
    });

    return AccountMapper.toDomain(prismaAccount);
  }

  async findById(id: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!prismaAccount) return null;

    return AccountMapper.toDomain(prismaAccount);
  }

  async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!prismaAccount) return null;

    return AccountMapper.toDomain(prismaAccount);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const prismaAccounts = await this.prisma.account.findMany({
      where: { userId },
    });

    return prismaAccounts.map(AccountMapper.toDomain);
  }

  /**
   * Aplica la operación monetaria en dominio y persiste cuentas + transacción de forma atómica.
   */
  async executeTransaction(transaction: Transaction): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      if (transaction instanceof Deposit) {
        const prismaDestination = await tx.account.findUniqueOrThrow({
          where: { id: transaction.destinationAccount },
        });
        const destination = AccountMapper.toDomain(prismaDestination);
        destination.deposit(transaction.amount);
        transaction.markAsCompleted();

        await tx.account.update({
          where: { id: prismaDestination.id },
          data: { balance: destination.balance },
        });

        const saved = await tx.transaction.create({
          data: TransactionMapper.toPersistence(transaction),
        });
        return TransactionMapper.toDomain(saved);
      }

      if (transaction instanceof Withdrawal) {
        const prismaSource = await tx.account.findUniqueOrThrow({
          where: { id: transaction.sourceAccount },
        });
        const source = AccountMapper.toDomain(prismaSource);
        source.withdraw(transaction.amount);
        transaction.markAsCompleted();

        await tx.account.update({
          where: { id: prismaSource.id },
          data: { balance: source.balance },
        });

        const saved = await tx.transaction.create({
          data: TransactionMapper.toPersistence(transaction),
        });
        return TransactionMapper.toDomain(saved);
      }

      if (transaction instanceof Transfer) {
        const prismaSource = await tx.account.findUniqueOrThrow({
          where: { id: transaction.sourceAccount },
        });
        const prismaDestination = await tx.account.findUniqueOrThrow({
          where: { id: transaction.destinationAccount },
        });

        const source = AccountMapper.toDomain(prismaSource);
        const destination = AccountMapper.toDomain(prismaDestination);

        source.withdraw(transaction.amount);
        destination.deposit(transaction.amount);
        transaction.markAsCompleted();

        await tx.account.update({
          where: { id: prismaSource.id },
          data: { balance: source.balance },
        });
        await tx.account.update({
          where: { id: prismaDestination.id },
          data: { balance: destination.balance },
        });

        const saved = await tx.transaction.create({
          data: TransactionMapper.toPersistence(transaction),
        });
        return TransactionMapper.toDomain(saved);
      }

      throw new Error("Instancia de transacción inválida para executeTransaction");
    });
  }

  async freeze(account: Account): Promise<void> {
    if (account.id === undefined) {
      throw new Error("No se puede congelar una cuenta sin id persistido.");
    }

    account.freeze();

    await this.prisma.account.update({
      where: { id: account.id },
      data: { status: account.status },
    });
  }

  async unfreeze(account: Account): Promise<void> {
    if (account.id === undefined) {
      throw new Error("No se puede descongelar una cuenta sin id persistido.");
    }

    account.unfreeze();

    await this.prisma.account.update({
      where: { id: account.id },
      data: { status: account.status },
    });
  }
}
