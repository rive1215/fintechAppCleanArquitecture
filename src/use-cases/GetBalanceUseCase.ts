import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountNotFoundError } from "../domain/exceptions/FinancialError";
import { AccountOutputDTO, GetBalanceInputDTO, toAccountOutputDTO } from "./dto/AccountDTOs";

/**
 * Caso de uso: consulta del saldo y datos de una cuenta.
 */
export class GetBalanceUseCase {
  constructor(private readonly accountRepository: AccountRepository) { }

  async execute(input: GetBalanceInputDTO): Promise<AccountOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }

    return toAccountOutputDTO(account);
  }
}
