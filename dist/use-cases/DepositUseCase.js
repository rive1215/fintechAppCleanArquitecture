"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositUseCase = void 0;
const decimal_js_1 = require("decimal.js");
const Transaction_1 = require("../domain/entities/Transaction");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
/**
 * RF-3.1 — Ingreso de fondos (DEPOSIT).
 * Valida monto > 0 y cuenta activa; acredita saldo vía executeTransaction.
 */
class DepositUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const { accountId, amount } = input;
        if (amount <= 0) {
            throw new FinancialError_1.InvalidAmountError("El monto del depósito debe ser estrictamente mayor a cero.");
        }
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(accountId);
        }
        if (account.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(accountId);
        }
        const depositAmount = new decimal_js_1.Decimal(amount);
        const transactionEntity = Transaction_1.Deposit.create({
            amount: depositAmount,
            status: "PENDING",
            destinationAccountId: accountId,
            createdAt: new Date(),
            description: `Depósito de ${depositAmount.toString()} en la cuenta ${accountId}.`,
        });
        const savedTransaction = await this.accountRepository.executeTransaction(transactionEntity);
        if (savedTransaction.id === undefined) {
            throw new Error("La transacción persistida no devolvió un id.");
        }
        return {
            transactionId: savedTransaction.id,
            accountId,
            amount: depositAmount.toNumber(),
            type: "DEPOSIT",
            executedAt: savedTransaction.createdAt,
        };
    }
}
exports.DepositUseCase = DepositUseCase;
//# sourceMappingURL=DepositUseCase.js.map