"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMapper = void 0;
const decimal_js_1 = require("decimal.js");
const client_1 = require("../../generated/prisma/client");
const Transaction_1 = require("../../domain/entities/Transaction");
class TransactionMapper {
    static toDomain(prismaTx) {
        const txProps = {
            id: prismaTx.id,
            amount: new decimal_js_1.Decimal(prismaTx.amount.toString()),
            status: prismaTx.status,
            description: prismaTx.description ?? '',
            createdAt: prismaTx.createdAt,
        };
        // Reconstrucción polimórfica basada en el discriminador STI
        switch (prismaTx.type) {
            case client_1.TransactionType.DEPOSIT:
                if (!prismaTx.destinationAccountId) {
                    throw new Error("Inconsistencia en DB: Deposit requiere destinationAccountId");
                }
                return Transaction_1.Deposit.create({ ...txProps, destinationAccountId: prismaTx.destinationAccountId });
            case client_1.TransactionType.WITHDRAWAL:
                if (!prismaTx.sourceAccountId) {
                    throw new Error("Inconsistencia en DB: Withdrawal requiere sourceAccountId");
                }
                return Transaction_1.Withdrawal.create({ ...txProps, sourceAccountId: prismaTx.sourceAccountId });
            case client_1.TransactionType.TRANSFER:
                if (!prismaTx.sourceAccountId || !prismaTx.destinationAccountId) {
                    throw new Error("Inconsistencia en DB: Transfer requiere ambas cuentas (origen y destino)");
                }
                return Transaction_1.Transfer.create({
                    ...txProps,
                    sourceAccountId: prismaTx.sourceAccountId,
                    destinationAccountId: prismaTx.destinationAccountId,
                });
            default:
                throw new Error(`Tipo de transacción desconocido o corrupto en DB: ${prismaTx.type}`);
        }
    }
    static toPersistence(transaction) {
        let type;
        let sourceAccountId = null;
        let destinationAccountId = null;
        // Dependiendo de la instancia en memoria, determinamos la forma del registro plano
        if (transaction instanceof Transaction_1.Deposit) {
            type = client_1.TransactionType.DEPOSIT;
            destinationAccountId = transaction.destinationAccount;
        }
        else if (transaction instanceof Transaction_1.Withdrawal) {
            type = client_1.TransactionType.WITHDRAWAL;
            sourceAccountId = transaction.sourceAccount;
        }
        else if (transaction instanceof Transaction_1.Transfer) {
            type = client_1.TransactionType.TRANSFER;
            sourceAccountId = transaction.sourceAccount;
            destinationAccountId = transaction.destinationAccount;
        }
        else {
            throw new Error("Instancia de transacción inválida proporcionada al Mapper");
        }
        const data = {
            amount: transaction.amount,
            type,
            status: transaction.status,
            description: transaction.description,
            sourceAccountId,
            destinationAccountId,
            createdAt: transaction.createdAt,
        };
        if (transaction.id !== undefined) {
            data.id = transaction.id;
        }
        return data;
    }
}
exports.TransactionMapper = TransactionMapper;
//# sourceMappingURL=TransactionMapper.js.map