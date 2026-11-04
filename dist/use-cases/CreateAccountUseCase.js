"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountUseCase = void 0;
const decimal_js_1 = require("decimal.js");
const Account_1 = require("../domain/entities/Account");
const AccountDTOs_1 = require("./dto/AccountDTOs");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
/**
 * Caso de uso: apertura de una nueva cuenta bancaria para un usuario existente.
 */
class CreateAccountUseCase {
    accountRepository;
    userRepository;
    constructor(accountRepository, userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }
    async execute(input) {
        const initialAmount = input.initialBalance ?? 0;
        if (initialAmount < 0) {
            throw new FinancialError_1.InvalidAmountError("El saldo inicial no puede ser negativo.");
        }
        const owner = await this.userRepository.findById(input.userId);
        if (!owner) {
            throw new FinancialError_1.UserNotFoundError(input.userId);
        }
        const accountNumber = `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`;
        const newAccount = Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber,
            balance: new decimal_js_1.Decimal(initialAmount),
            userId: owner.id,
            status: "ACTIVE",
            createdAt: new Date(),
        });
        const savedAccount = await this.accountRepository.save(newAccount);
        return (0, AccountDTOs_1.toAccountOutputDTO)(savedAccount);
    }
}
exports.CreateAccountUseCase = CreateAccountUseCase;
//# sourceMappingURL=CreateAccountUseCase.js.map