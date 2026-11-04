import { Decimal } from "decimal.js";
import { Account } from "../../domain/entities/Account";
export interface CreateAccountInputDTO {
    userId: string;
    initialBalance?: number;
}
export interface AccountOutputDTO {
    id: string;
    accountNumber: string;
    balance: Decimal;
    status: string;
    userId: string;
    createdAt: Date;
}
export interface GetBalanceInputDTO {
    accountId: string;
}
export interface FreezeAccountInputDTO {
    accountId: string;
}
export interface UnfreezeAccountInputDTO {
    accountId: string;
}
/**
 * Proyecta una Account de dominio a DTO de salida.
 * Tras persistencia, id y createdAt deben existir.
 */
export declare function toAccountOutputDTO(account: Account): AccountOutputDTO;
//# sourceMappingURL=AccountDTOs.d.ts.map