import { Decimal } from "decimal.js";
import { AccountRepository, UserRepository } from "../domain/repositories/Repositories";
import { Account } from "../domain/entities/Account";
import { CreateAccountInputDTO, AccountOutputDTO, toAccountOutputDTO } from "./dto/AccountDTOs";
import { InvalidAmountError, UserNotFoundError } from "../domain/exceptions/FinancialError";

/**
 * Caso de uso: apertura de una nueva cuenta bancaria para un usuario existente.
 */
export class CreateAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async execute(input: CreateAccountInputDTO): Promise<AccountOutputDTO> {
    const initialAmount = input.initialBalance ?? 0;

    if (initialAmount < 0) {
      throw new InvalidAmountError("El saldo inicial no puede ser negativo.");
    }

    const owner = await this.userRepository.findById(input.userId);
    if (!owner) {
      throw new UserNotFoundError(input.userId);
    }

    const accountNumber = `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newAccount = Account.create({
      id: crypto.randomUUID(),
      accountNumber,
      balance: new Decimal(initialAmount),
      userId: owner.id,
      status: "ACTIVE",
      createdAt: new Date(),
    });

    const savedAccount = await this.accountRepository.save(newAccount);

    return toAccountOutputDTO(savedAccount);
  }
}
