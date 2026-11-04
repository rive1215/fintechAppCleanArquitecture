"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTransactionHistoryUseCase = void 0;
const Transaction_1 = require("../domain/entities/Transaction");
class GetTransactionHistoryUseCase {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async execute(input) {
        const transactions = await this.transactionRepository.findByAccountId(input.accountId);
        return {
            accountId: input.accountId,
            transactions: transactions.map((transaction) => this.toHistoryItem(transaction)),
        };
    }
    toHistoryItem(transaction) {
        if (transaction.id === undefined) {
            throw new Error("La transacción persistida es inconsistente: falta id.");
        }
        const type = transaction instanceof Transaction_1.Deposit
            ? "DEPOSIT"
            : transaction instanceof Transaction_1.Withdrawal
                ? "WITHDRAWAL"
                : "TRANSFER";
        const item = {
            id: transaction.id,
            type,
            amount: transaction.amount.toNumber(),
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt,
        };
        if (transaction instanceof Transaction_1.Withdrawal || transaction instanceof Transaction_1.Transfer) {
            item.sourceAccountId = transaction.sourceAccount;
        }
        if (transaction instanceof Transaction_1.Deposit || transaction instanceof Transaction_1.Transfer) {
            item.destinationAccountId = transaction.destinationAccount;
        }
        return item;
    }
}
exports.GetTransactionHistoryUseCase = GetTransactionHistoryUseCase;
//# sourceMappingURL=GetTransactionHistoryUseCase.js.map