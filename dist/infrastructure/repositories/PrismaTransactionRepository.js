"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTransactionRepository = void 0;
const TransactionMapper_1 = require("../mappers/TransactionMapper");
class PrismaTransactionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(transaction) {
        const data = TransactionMapper_1.TransactionMapper.toPersistence(transaction);
        // Sin id: alta nueva (la DB genera el UUID)
        if (transaction.id === undefined) {
            const created = await this.prisma.transaction.create({ data });
            return TransactionMapper_1.TransactionMapper.toDomain(created);
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
        return TransactionMapper_1.TransactionMapper.toDomain(prismaTransaction);
    }
    async findById(id) {
        const prismaTransaction = await this.prisma.transaction.findUnique({
            where: { id },
        });
        if (!prismaTransaction)
            return null;
        return TransactionMapper_1.TransactionMapper.toDomain(prismaTransaction);
    }
    /**
     * Historial de una cuenta: depósitos, retiros y transferencias donde participa
     * como origen o destino, ordenado del más reciente al más antiguo.
     */
    async findByAccountId(accountId) {
        const prismaTransactions = await this.prisma.transaction.findMany({
            where: {
                OR: [
                    { sourceAccountId: accountId },
                    { destinationAccountId: accountId },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return prismaTransactions.map(TransactionMapper_1.TransactionMapper.toDomain);
    }
}
exports.PrismaTransactionRepository = PrismaTransactionRepository;
//# sourceMappingURL=PrismaTransactionRepository.js.map