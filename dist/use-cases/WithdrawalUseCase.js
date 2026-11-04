"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalUseCase = void 0;
const decimal_js_1 = require("decimal.js");
const Transaction_1 = require("../domain/entities/Transaction");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
/**
 * RF-3.2 — Retiro de fondos (WITHDRAWAL).
 * Valida monto > 0, cuenta ACTIVE y saldo B ≥ amount; debita vía executeTransaction.
 */
class WithdrawalUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const { accountId, amount } = input;
        if (amount <= 0) {
            throw new FinancialError_1.InvalidAmountError("El monto del retiro debe ser estrictamente mayor a cero.");
        }
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(accountId);
        }
        if (account.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(accountId);
        }
        const withdrawalAmount = new decimal_js_1.Decimal(amount);
        if (account.balance.lessThan(withdrawalAmount)) {
            throw new FinancialError_1.InsufficientBalanceError(accountId);
        }
        const transactionEntity = Transaction_1.Withdrawal.create({
            amount: withdrawalAmount,
            status: "PENDING",
            sourceAccountId: accountId,
            createdAt: new Date(),
            description: `Retiro de ${withdrawalAmount.toString()} desde la cuenta ${accountId}.`,
        });
        const savedTransaction = await this.accountRepository.executeTransaction(transactionEntity);
        if (savedTransaction.id === undefined) {
            throw new Error("La transacción persistida no devolvió un id.");
        }
        return {
            transactionId: savedTransaction.id,
            accountId,
            amount: withdrawalAmount.toNumber(),
            type: "WITHDRAWAL",
            executedAt: savedTransaction.createdAt,
        };
    }
}
exports.WithdrawalUseCase = WithdrawalUseCase;
//# sourceMappingURL=WithdrawalUseCase.js.map