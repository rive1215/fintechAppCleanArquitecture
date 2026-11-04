"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = exports.AccountNotFoundError = exports.InvalidAmountError = exports.AccountFrozenError = exports.InsufficientBalanceError = void 0;
const DomainError_1 = require("./DomainError");
class InsufficientBalanceError extends DomainError_1.DomainError {
    constructor(accountId) {
        super(`Operación denegada: Saldo insuficiente en la cuenta [${accountId}].`);
    }
}
exports.InsufficientBalanceError = InsufficientBalanceError;
class AccountFrozenError extends DomainError_1.DomainError {
    constructor(accountId) {
        super(`Alerta de seguridad: La cuenta [${accountId}] se encuentra congelada.`);
    }
}
exports.AccountFrozenError = AccountFrozenError;
class InvalidAmountError extends DomainError_1.DomainError {
    constructor(message) {
        super(`Validación monetaria fallida: ${message}`);
    }
}
exports.InvalidAmountError = InvalidAmountError;
class AccountNotFoundError extends DomainError_1.DomainError {
    constructor(accountId) {
        super(`La cuenta con ID '${accountId}' no fue encontrada o no existe.`);
    }
}
exports.AccountNotFoundError = AccountNotFoundError;
class UserNotFoundError extends DomainError_1.DomainError {
    constructor(userId) {
        super(`El usuario con ID '${userId}' no fue encontrado o no existe.`);
    }
}
exports.UserNotFoundError = UserNotFoundError;
//# sourceMappingURL=FinancialError.js.map