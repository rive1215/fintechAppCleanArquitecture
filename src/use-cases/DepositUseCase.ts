import { Decimal } from "decimal.js";
import { AccountRepository } from "../domain/repositories/Repositories";
import { Deposit } from "../domain/entities/Transaction";
import {
  AccountNotFoundError,
  AccountFrozenError,
  InvalidAmountError,
} from "../domain/exceptions/FinancialError";
import { DepositFundsInputDTO, DepositFundsOutputDTO } from "./dto/FundMovementDTOs";

/**
 * RF-3.1 — Ingreso de fondos (DEPOSIT).
 * Valida monto > 0 y cuenta activa; acredita saldo vía executeTransaction.
 */
export class DepositUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: DepositFundsInputDTO): Promise<DepositFundsOutputDTO> {
    const { accountId, amount } = input;

    if (amount <= 0) {
      throw new InvalidAmountError("El monto del depósito debe ser estrictamente mayor a cero.");
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    if (account.status === "FROZEN") {
      throw new AccountFrozenError(accountId);
    }

    const depositAmount = new Decimal(amount);

    const transactionEntity = Deposit.create({
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
