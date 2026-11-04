export declare const AccountStatus: {
    readonly ACTIVE: 'ACTIVE';
    readonly FROZEN: 'FROZEN';
};
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
export declare const TransactionType: {
    readonly DEPOSIT: 'DEPOSIT';
    readonly WITHDRAWAL: 'WITHDRAWAL';
    readonly TRANSFER: 'TRANSFER';
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export declare const TransactionStatus: {
    readonly PENDING: 'PENDING';
    readonly COMPLETED: 'COMPLETED';
    readonly FAILED: 'FAILED';
};
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
//# sourceMappingURL=enums.d.ts.map