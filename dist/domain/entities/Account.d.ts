import { Decimal } from "decimal.js";
export type AccountStatus = "ACTIVE" | "FROZEN";
export interface AccountProps {
    id?: string;
    accountNumber: string;
    balance: Decimal;
    userId: string;
    status: AccountStatus;
    createdAt?: Date;
}
export declare class Account {
    private readonly props;
    private constructor();
    static create(props: AccountProps): Account;
    get id(): string | undefined;
    get accountNumber(): string;
    get balance(): Decimal;
    get userId(): string;
    get status(): AccountStatus;
    get createdAt(): Date | undefined;
    deposit(amount: Decimal): void;
    withdraw(amount: Decimal): void;
    freeze(): void;
    unfreeze(): void;
}
//# sourceMappingURL=Account.d.ts.map