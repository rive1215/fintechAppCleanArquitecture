import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountNotFoundError } from "../domain/exceptions/FinancialError";
import { InvalidPropValueError } from "../domain/exceptions/DomainError";
import {
  AccountOutputDTO,
  UnfreezeAccountInputDTO,
  toAccountOutputDTO,
} from "./dto/AccountDTOs";

/**
 * Descongela una cuenta FROZEN → ACTIVE.
 */
export class UnfreezeAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: UnfreezeAccountInputDTO): Promise<AccountOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }

    if (account.status === "ACTIVE") {
      throw new InvalidPropValueError("La cuenta ya se encuentra activa.");
    }

    await this.accountRepository.unfreeze(account);

    return toAccountOutputDTO(account);
  }
}
