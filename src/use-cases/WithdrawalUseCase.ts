import { Decimal } from "decimal.js";
import { AccountRepository } from "../domain/repositories/Repositories";
import { Withdrawal } from "../domain/entities/Transaction";
import {
  AccountNotFoundError,
  AccountFrozenError,
  InsufficientBalanceError,
  InvalidAmountError,
} from "../domain/exceptions/FinancialError";
import { WithdrawalFundsInputDTO, WithdrawalFundsOutputDTO } from "./dto/FundMovementDTOs";

/**
 * RF-3.2 — Retiro de fondos (WITHDRAWAL).
 * Valida monto > 0, cuenta ACTIVE y saldo B ≥ amount; debita vía executeTransaction.
 */
export class WithdrawalUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: WithdrawalFundsInputDTO): Promise<WithdrawalFundsOutputDTO> {
    const { accountId, amount } = input;

    if (amount <= 0) {
      throw new InvalidAmountError("El monto del retiro debe ser estrictamente mayor a cero.");
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    if (account.status === "FROZEN") {
      throw new AccountFrozenError(accountId);
    }

    const withdrawalAmount = new Decimal(amount);

    if (account.balance.lessThan(withdrawalAmount)) {
      throw new InsufficientBalanceError(accountId);
    }

    const transactionEntity = Withdrawal.create({
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
