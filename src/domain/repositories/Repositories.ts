import { Account } from "../entities/Account";
import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";
import { Decimal } from "decimal.js";

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByAccountNumber(accountNumber: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  save(account: Account): Promise<Account>;

  executeTransaction(transaction: Transaction): Promise<Transaction>;
  freeze(account: Account): Promise<void>;
  unfreeze(account: Account): Promise<void>;
}

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
}