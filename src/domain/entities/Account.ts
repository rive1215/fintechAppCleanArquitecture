import { Decimal } from "decimal.js";
import { AccountFrozenError, InsufficientBalanceError, InvalidAmountError } from "../exceptions/FinancialError";
import { InvalidPropValueError } from "../exceptions/DomainError";

export type AccountStatus = "ACTIVE" | "FROZEN";

export interface AccountProps {
  id?: string;
  accountNumber: string;
  balance: Decimal;
  userId: string;
  status: AccountStatus;
  createdAt?: Date;
}

export class Account {
  private readonly props: AccountProps;

  private constructor(props: AccountProps) {
    this.props = props;
  }

  public static create(props: AccountProps): Account {
    if (props.balance.isNegative()) {
      throw new InvalidPropValueError('Una cuenta no puede ser inicializada con saldo negativo.');
    }
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    return new Account(props);
  }

  // getters
  public get id(): string | undefined { return this.props.id; }
  public get accountNumber(): string { return this.props.accountNumber; }
  public get balance(): Decimal { return this.props.balance; }
  public get userId(): string { return this.props.userId; }
  public get status(): AccountStatus { return this.props.status; }
  public get createdAt(): Date | undefined { return this.props.createdAt; }

  // Comportamientos de dominio
  public deposit(amount: Decimal): void {
    if (amount.lte(0)) {
      throw new InvalidAmountError("El monto del depósito debe ser estrictamente mayor a cero.");
    }
    if (this.props.status === "FROZEN") {
      throw new AccountFrozenError(this.id!);
    }

    this.props.balance = this.props.balance.plus(amount); 
  }

  public withdraw(amount: Decimal): void {
    if (amount.lte(0)) {
      throw new InvalidAmountError("El monto del retiro debe ser estrictamente mayor a cero.");
    }
    if (this.props.status === "FROZEN") {
      throw new AccountFrozenError(this.id!);
    }
    if (this.props.balance.lessThan(amount)) {
      throw new InsufficientBalanceError(this.id!);
    }

    this.props.balance = this.props.balance.minus(amount);
  }

  public freeze(): void {
    if (this.props.status === "FROZEN") {
      throw new InvalidPropValueError("La cuenta ya se encuentra congelada.");
    }
    this.props.status = "FROZEN";
  }

  public unfreeze(): void {
    if (this.props.status === "ACTIVE") {
      throw new InvalidPropValueError("La cuenta ya se encuentra activa.");
    }
    this.props.status = "ACTIVE";
  }
}
