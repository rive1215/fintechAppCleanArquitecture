import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountNotFoundError } from "../domain/exceptions/FinancialError";
import { InvalidPropValueError } from "../domain/exceptions/DomainError";
import {
  AccountOutputDTO,
  FreezeAccountInputDTO,
  toAccountOutputDTO,
} from "./dto/AccountDTOs";

/**
 * Congela una cuenta ACTIVE → FROZEN.
 */
export class FreezeAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: FreezeAccountInputDTO): Promise<AccountOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }

    if (account.status === "FROZEN") {
      throw new InvalidPropValueError("La cuenta ya se encuentra congelada.");
    }

    await this.accountRepository.freeze(account);

    return toAccountOutputDTO(account);
  }
}
