import { Decimal } from "decimal.js";
export interface TransactionProps {
    id?: string;
    amount: Decimal;
    status: TransactionStatus;
    description: string;
    createdAt: Date;
}
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export declare abstract class Transaction {
    private readonly props;
    protected constructor(props: TransactionProps);
    static validateAmount(props: TransactionProps, errorMessage: string): void;
    get id(): string | undefined;
    get amount(): Decimal;
    get status(): TransactionStatus;
    get description(): string;
    get createdAt(): Date;
    markAsCompleted(): void;
    markAsFailed(): void;
}
export interface DepositProps extends TransactionProps {
    destinationAccountId: string;
}
export declare class Deposit extends Transaction {
    private readonly destinationAccountId;
    private constructor();
    static create(props: DepositProps): Deposit;
    get destinationAccount(): string;
}
export interface WithdrawalProps extends TransactionProps {
    sourceAccountId: string;
}
export declare class Withdrawal extends Transaction {
    private readonly sourceAccountId;
    private constructor();
    static create(props: WithdrawalProps): Withdrawal;
    get sourceAccount(): string;
}
export interface TransferProps extends TransactionProps {
    sourceAccountId: string;
    destinationAccountId: string;
}
export declare class Transfer extends Transaction {
    private readonly sourceAccountId;
    private readonly destinationAccountId;
    private constructor();
    static create(props: TransferProps): Transfer;
    get sourceAccount(): string;
    get destinationAccount(): string;
}
//# sourceMappingURL=Transaction.d.ts.map