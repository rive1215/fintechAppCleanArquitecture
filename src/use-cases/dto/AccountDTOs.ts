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
export function toAccountOutputDTO(account: Account): AccountOutputDTO {
  if (account.id === undefined || account.createdAt === undefined) {
    throw new Error("La cuenta persistida es inconsistente: faltan id o createdAt.");
  }

  return {
    id: account.id,
    accountNumber: account.accountNumber,
    balance: account.balance,
    status: account.status,
    userId: account.userId,
    createdAt: account.createdAt,
  };
}
