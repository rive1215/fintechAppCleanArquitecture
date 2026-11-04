"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAccountRepository = void 0;
const client_1 = require("../../generated/prisma/client");
const Transaction_1 = require("../../domain/entities/Transaction");
const AccountMapper_1 = require("../mappers/AccountMapper");
const TransactionMapper_1 = require("../mappers/TransactionMapper");
class PrismaAccountRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(account) {
        const data = AccountMapper_1.AccountMapper.toPersistence(account);
        if (account.id === undefined) {
            const created = await this.prisma.account.create({ data });
            return AccountMapper_1.AccountMapper.toDomain(created);
        }
        const prismaAccount = await this.prisma.account.upsert({
            where: { id: account.id },
            update: {
                balance: account.balance,
                status: account.status,
            },
            create: data,
        });
        return AccountMapper_1.AccountMapper.toDomain(prismaAccount);
    }
    async findById(id) {
        const prismaAccount = await this.prisma.account.findUnique({
            where: { id },
        });
        if (!prismaAccount)
            return null;
        return AccountMapper_1.AccountMapper.toDomain(prismaAccount);
    }
    async findByAccountNumber(accountNumber) {
        const prismaAccount = await this.prisma.account.findUnique({
            where: { accountNumber },
        });
        if (!prismaAccount)
            return null;
        return AccountMapper_1.AccountMapper.toDomain(prismaAccount);
    }
    async findByUserId(userId) {
        const prismaAccounts = await this.prisma.account.findMany({
            where: { userId },
        });
        return prismaAccounts.map(AccountMapper_1.AccountMapper.toDomain);
    }
    /**
     * Ejecuta Deposit / Withdrawal / Transfer de forma atómica con prisma.$transaction:
     * actualiza saldos vía métodos de dominio y persiste el registro STI de Transaction.
     * Si cualquier paso falla, Prisma hace rollback de toda la unidad de trabajo.
     */
    async executeTransaction(transaction) {
        return this.prisma.$transaction(async (tx) => {
            if (transaction instanceof Transaction_1.Deposit) {
                return this.executeDeposit(tx, transaction);
            }
            if (transaction instanceof Transaction_1.Withdrawal) {
                return this.executeWithdrawal(tx, transaction);
            }
            if (transaction instanceof Transaction_1.Transfer) {
                return this.executeTransfer(tx, transaction);
            }
            throw new Error("Instancia de transacción inválida para executeTransaction");
        }, {
            // Serializable reduce lecturas sucias/anomalías en operaciones monetarias concurrentes
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5_000,
            timeout: 10_000,
        });
    }
    async freeze(account) {
        if (account.id === undefined) {
            throw new Error("No se puede congelar una cuenta sin id persistido.");
        }
        account.freeze();
        await this.prisma.account.update({
            where: { id: account.id },
            data: { status: account.status },
        });
    }
    async unfreeze(account) {
        if (account.id === undefined) {
            throw new Error("No se puede descongelar una cuenta sin id persistido.");
        }
        account.unfreeze();
        await this.prisma.account.update({
            where: { id: account.id },
            data: { status: account.status },
        });
    }
    async executeDeposit(tx, transaction) {
        const prismaDestination = await tx.account.findUniqueOrThrow({
            where: { id: transaction.destinationAccount },
        });
        const destination = AccountMapper_1.AccountMapper.toDomain(prismaDestination);
        destination.deposit(transaction.amount);
        transaction.markAsCompleted();
        await tx.account.update({
            where: { id: prismaDestination.id },
            data: { balance: destination.balance },
        });
        const saved = await tx.transaction.create({
            data: TransactionMapper_1.TransactionMapper.toPersistence(transaction),
        });
        return TransactionMapper_1.TransactionMapper.toDomain(saved);
    }
    async executeWithdrawal(tx, transaction) {
        const prismaSource = await tx.account.findUniqueOrThrow({
            where: { id: transaction.sourceAccount },
        });
        const source = AccountMapper_1.AccountMapper.toDomain(prismaSource);
        source.withdraw(transaction.amount);
        transaction.markAsCompleted();
        await tx.account.update({
            where: { id: prismaSource.id },
            data: { balance: source.balance },
        });
        const saved = await tx.transaction.create({
            data: TransactionMapper_1.TransactionMapper.toPersistence(transaction),
        });
        return TransactionMapper_1.TransactionMapper.toDomain(saved);
    }
    async executeTransfer(tx, transaction) {
        const prismaSource = await tx.account.findUniqueOrThrow({
            where: { id: transaction.sourceAccount },
        });
        const prismaDestination = await tx.account.findUniqueOrThrow({
            where: { id: transaction.destinationAccount },
        });
        const source = AccountMapper_1.AccountMapper.toDomain(prismaSource);
        const destination = AccountMapper_1.AccountMapper.toDomain(prismaDestination);
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
            data: TransactionMapper_1.TransactionMapper.toPersistence(transaction),
        });
        return TransactionMapper_1.TransactionMapper.toDomain(saved);
    }
}
exports.PrismaAccountRepository = PrismaAccountRepository;
//# sourceMappingURL=PrismaAccountRepository.js.map