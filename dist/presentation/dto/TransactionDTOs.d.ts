import { z } from 'zod';
/**
 * Esquema de validación para la ejecución de una transferencia bancaria.
 */
export declare const TransferMoneySchema: z.ZodObject<{
    sourceAccountId: z.ZodUUID;
    destinationAccountId: z.ZodUUID;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const DepositFundsSchema: z.ZodObject<{
    accountId: z.ZodUUID;
    amount: z.ZodNumber;
}, z.core.$strip>;
export declare const WithdrawalFundsSchema: z.ZodObject<{
    accountId: z.ZodUUID;
    amount: z.ZodNumber;
}, z.core.$strip>;
export type TransferMoneyDTO = z.infer<typeof TransferMoneySchema>;
export type DepositFundsDTO = z.infer<typeof DepositFundsSchema>;
export type WithdrawalFundsDTO = z.infer<typeof WithdrawalFundsSchema>;
//# sourceMappingURL=TransactionDTOs.d.ts.map