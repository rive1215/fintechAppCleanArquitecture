"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferMoneyUseCase = void 0;
const Transaction_1 = require("../domain/entities/Transaction");
const DomainError_1 = require("../domain/exceptions/DomainError");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const decimal_js_1 = require("decimal.js");
/**
 * Caso de uso: transferencia de fondos entre dos cuentas.
 * Las invariantes de negocio se validan aquí; la atomicidad de persistencia
 * se delega a AccountRepository.executeTransaction (prisma.$transaction).
 */
class TransferMoneyUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const { sourceAccountId, destinationAccountId, amount } = input;
        if (amount <= 0) {
            throw new FinancialError_1.InvalidAmountError("El monto de la transferencia debe ser estrictamente mayor a cero.");
        }
        if (sourceAccountId === destinationAccountId) {
            throw new DomainError_1.InvalidPropValueError("La cuenta de origen y destino no pueden ser idénticas.");
        }
        const transferAmount = new decimal_js_1.Decimal(amount);
        const sourceAccount = await this.accountRepository.findById(sourceAccountId);
        if (!sourceAccount) {
            throw new FinancialError_1.AccountNotFoundError(sourceAccountId);
        }
        if (sourceAccount.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(sourceAccountId);
        }
        if (sourceAccount.balance.lessThan(transferAmount)) {
            throw new FinancialError_1.InsufficientBalanceError(sourceAccountId);
        }
        const destinationAccount = await this.accountRepository.findById(destinationAccountId);
        if (!destinationAccount) {
            throw new FinancialError_1.AccountNotFoundError(destinationAccountId);
        }
        if (destinationAccount.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(destinationAccountId);
        }
        const transactionEntity = Transaction_1.Transfer.create({
            amount: transferAmount,
            status: "PENDING",
            sourceAccountId,
            destinationAccountId,
            createdAt: new Date(),
            description: `Transferencia de ${transferAmount.toString()} desde ${sourceAccountId} hacia ${destinationAccountId}.`,
        });
        const savedTransaction = await this.accountRepository.executeTransaction(transactionEntity);
        if (savedTransaction.id === undefined) {
            throw new Error("La transacción persistida no devolvió un id.");
        }
        return {
            transactionId: savedTransaction.id,
            sourceAccountId,
            destinationAccountId,
            amount: transferAmount.toNumber(),
            executedAt: savedTransaction.createdAt,
        };
    }
}
exports.TransferMoneyUseCase = TransferMoneyUseCase;
//# sourceMappingURL=TransferMoneyUseCase.js.map