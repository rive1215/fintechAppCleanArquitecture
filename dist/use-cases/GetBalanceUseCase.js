"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBalanceUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const AccountDTOs_1 = require("./dto/AccountDTOs");
/**
 * Caso de uso: consulta del saldo y datos de una cuenta.
 */
class GetBalanceUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const account = await this.accountRepository.findById(input.accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(input.accountId);
        }
        return (0, AccountDTOs_1.toAccountOutputDTO)(account);
    }
}
exports.GetBalanceUseCase = GetBalanceUseCase;
//# sourceMappingURL=GetBalanceUseCase.js.map