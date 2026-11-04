"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnfreezeAccountUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const DomainError_1 = require("../domain/exceptions/DomainError");
const AccountDTOs_1 = require("./dto/AccountDTOs");
/**
 * Descongela una cuenta FROZEN → ACTIVE.
 */
class UnfreezeAccountUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const account = await this.accountRepository.findById(input.accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(input.accountId);
        }
        if (account.status === "ACTIVE") {
            throw new DomainError_1.InvalidPropValueError("La cuenta ya se encuentra activa.");
        }
        await this.accountRepository.unfreeze(account);
        return (0, AccountDTOs_1.toAccountOutputDTO)(account);
    }
}
exports.UnfreezeAccountUseCase = UnfreezeAccountUseCase;
//# sourceMappingURL=UnfreezeAccountUseCase.js.map