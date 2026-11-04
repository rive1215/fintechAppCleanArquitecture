"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserAccountsUseCase = void 0;
const AccountDTOs_1 = require("./dto/AccountDTOs");
/**
 * Caso de uso: listar las cuentas pertenecientes a un usuario autenticado.
 */
class GetUserAccountsUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(userId) {
        const accounts = await this.accountRepository.findByUserId(userId);
        return accounts.map(AccountDTOs_1.toAccountOutputDTO);
    }
}
exports.GetUserAccountsUseCase = GetUserAccountsUseCase;
//# sourceMappingURL=GetUserAccountsUseCase.js.map