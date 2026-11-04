import { DomainError } from "./DomainError";
export declare class UserAlreadyExistsError extends DomainError {
    constructor(email: string);
}
export declare class InvalidCredentialsError extends DomainError {
    constructor(message?: string);
}
//# sourceMappingURL=UserError.d.ts.map