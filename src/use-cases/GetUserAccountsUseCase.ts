import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountOutputDTO, toAccountOutputDTO } from "./dto/AccountDTOs";

/**
 * Caso de uso: listar las cuentas pertenecientes a un usuario autenticado.
 */
export class GetUserAccountsUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(userId: string): Promise<AccountOutputDTO[]> {
    const accounts = await this.accountRepository.findByUserId(userId);
    return accounts.map(toAccountOutputDTO);
  }
}
