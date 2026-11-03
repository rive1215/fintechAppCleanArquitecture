import { AccountRepository } from "../domain/repositories/Repositories";
import { Transfer } from "../domain/entities/Transaction";
import { InvalidPropValueError } from "../domain/exceptions/DomainError";
import {
  AccountNotFoundError,
  AccountFrozenError,
  InsufficientBalanceError,
  InvalidAmountError,
} from "../domain/exceptions/FinancialError";
import { TransferMoneyInputDTO, TransferMoneyOutputDTO } from "./dto/TransferDTOs";
import { Decimal } from "decimal.js";

/**
 * Caso de uso: transferencia de fondos entre dos cuentas.
 * Las invariantes de negocio se validan aquí; la atomicidad de persistencia
 * se delega a AccountRepository.executeTransaction (prisma.$transaction).
 */
export class TransferMoneyUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: TransferMoneyInputDTO): Promise<TransferMoneyOutputDTO> {
    const { sourceAccountId, destinationAccountId, amount } = input;

    if (amount <= 0) {
      throw new InvalidAmountError("El monto de la transferencia debe ser estrictamente mayor a cero.");
    }

    if (sourceAccountId === destinationAccountId) {
      throw new InvalidPropValueError("La cuenta de origen y destino no pueden ser idénticas.");
    }

    const transferAmount = new Decimal(amount);

    const sourceAccount = await this.accountRepository.findById(sourceAccountId);
    if (!sourceAccount) {
      throw new AccountNotFoundError(sourceAccountId);
    }

    if (sourceAccount.status === "FROZEN") {
      throw new AccountFrozenError(sourceAccountId);
    }

    if (sourceAccount.balance.lessThan(transferAmount)) {
      throw new InsufficientBalanceError(sourceAccountId);
    }

    const destinationAccount = await this.accountRepository.findById(destinationAccountId);
    if (!destinationAccount) {
      throw new AccountNotFoundError(destinationAccountId);
    }

    if (destinationAccount.status === "FROZEN") {
      throw new AccountFrozenError(destinationAccountId);
    }

    const transactionEntity = Transfer.create({
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
