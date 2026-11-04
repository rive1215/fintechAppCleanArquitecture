"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreezeAccountUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const DomainError_1 = require("../domain/exceptions/DomainError");
const AccountDTOs_1 = require("./dto/AccountDTOs");
/**
 * Congela una cuenta ACTIVE → FROZEN.
 */
class FreezeAccountUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const account = await this.accountRepository.findById(input.accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(input.accountId);
        }
        if (account.status === "FROZEN") {
            throw new DomainError_1.InvalidPropValueError("La cuenta ya se encuentra congelada.");
        }
        await this.accountRepository.freeze(account);
        return (0, AccountDTOs_1.toAccountOutputDTO)(account);
    }
}
exports.FreezeAccountUseCase = FreezeAccountUseCase;
//# sourceMappingURL=FreezeAccountUseCase.js.map