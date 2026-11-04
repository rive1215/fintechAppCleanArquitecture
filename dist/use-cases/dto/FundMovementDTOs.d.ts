export interface DepositFundsInputDTO {
    accountId: string;
    amount: number;
}
export interface DepositFundsOutputDTO {
    transactionId: string;
    accountId: string;
    amount: number;
    type: "DEPOSIT";
    executedAt: Date;
}
export interface WithdrawalFundsInputDTO {
    accountId: string;
    amount: number;
}
export interface WithdrawalFundsOutputDTO {
    transactionId: string;
    accountId: string;
    amount: number;
    type: "WITHDRAWAL";
    executedAt: Date;
}
//# sourceMappingURL=FundMovementDTOs.d.ts.map