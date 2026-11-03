import { Prisma, PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/Repositories';
import { Account } from '../../domain/entities/Account';
import { Deposit, Transfer, Transaction, Withdrawal } from '../../domain/entities/Transaction';
import { AccountMapper } from '../mappers/AccountMapper';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async save(account: Account): Promise<Account> {
    const data = AccountMapper.toPersistence(account);

    if (account.id === undefined) {
      const created = await this.prisma.account.create({ data });
      return AccountMapper.toDomain(created);
    }

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
   * Ejecuta Deposit / Withdrawal / Transfer de forma atómica con prisma.$transaction:
   * actualiza saldos vía métodos de dominio y persiste el registro STI de Transaction.
   * Si cualquier paso falla, Prisma hace rollback de toda la unidad de trabajo.
   */
  async executeTransaction(transaction: Transaction): Promise<Transaction> {
    return this.prisma.$transaction(
      async (tx) => {
        if (transaction instanceof Deposit) {
          return this.executeDeposit(tx, transaction);
        }

        if (transaction instanceof Withdrawal) {
          return this.executeWithdrawal(tx, transaction);
        }

        if (transaction instanceof Transfer) {
          return this.executeTransfer(tx, transaction);
        }

        throw new Error("Instancia de transacción inválida para executeTransaction");
      },
      {
        // Serializable reduce lecturas sucias/anomalías en operaciones monetarias concurrentes
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5_000,
        timeout: 10_000,
      },
    );
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

  private async executeDeposit(
    tx: Prisma.TransactionClient,
    transaction: Deposit,
  ): Promise<Transaction> {
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

  private async executeWithdrawal(
    tx: Prisma.TransactionClient,
    transaction: Withdrawal,
  ): Promise<Transaction> {
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

  private async executeTransfer(
    tx: Prisma.TransactionClient,
    transaction: Transfer,
  ): Promise<Transaction> {
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
}
