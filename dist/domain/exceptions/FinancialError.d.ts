import { DomainError } from './DomainError';
export declare class InsufficientBalanceError extends DomainError {
    constructor(accountId: string);
}
export declare class AccountFrozenError extends DomainError {
    constructor(accountId: string);
}
export declare class InvalidAmountError extends DomainError {
    constructor(message: string);
}
export declare class AccountNotFoundError extends DomainError {
    constructor(accountId: string);
}
export declare class UserNotFoundError extends DomainError {
    constructor(userId: string);
}
//# sourceMappingURL=FinancialError.d.ts.map