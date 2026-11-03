import { TransactionRepository } from "../domain/repositories/Repositories";
import {
  GetTransactionHistoryInputDTO,
  GetTransactionHistoryOutputDTO,
  TransactionHistoryItemDTO,
} from "./dto/TransactionHistoryDTOs";
import { Deposit, Withdrawal, Transaction, Transfer } from "../domain/entities/Transaction";

export class GetTransactionHistoryUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) { }

  async execute(input: GetTransactionHistoryInputDTO): Promise<GetTransactionHistoryOutputDTO> {
    const transactions = await this.transactionRepository.findByAccountId(input.accountId);

    return {
      accountId: input.accountId,
      transactions: transactions.map((transaction: Transaction) => this.toHistoryItem(transaction)),
    };
  }

  private toHistoryItem(transaction: Transaction): TransactionHistoryItemDTO {
    if (transaction.id === undefined) {
      throw new Error("La transacción persistida es inconsistente: falta id.");
    }

    const type = transaction instanceof Deposit
      ? "DEPOSIT"
      : transaction instanceof Withdrawal
        ? "WITHDRAWAL"
        : "TRANSFER";

    const item: TransactionHistoryItemDTO = {
      id: transaction.id,
      type,
      amount: transaction.amount.toNumber(),
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
    };

    if (transaction instanceof Withdrawal || transaction instanceof Transfer) {
      item.sourceAccountId = transaction.sourceAccount;
    }

    if (transaction instanceof Deposit || transaction instanceof Transfer) {
      item.destinationAccountId = transaction.destinationAccount;
    }

    return item;
  }
}
