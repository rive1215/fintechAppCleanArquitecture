import { DomainError } from './DomainError';

export class InsufficientBalanceError extends DomainError {
  constructor(accountId: string) {
    super(`Operación denegada: Saldo insuficiente en la cuenta [${accountId}].`);
  }
}

export class AccountFrozenError extends DomainError {
  constructor(accountId: string) {
    super(`Alerta de seguridad: La cuenta [${accountId}] se encuentra congelada.`);
  }
}

export class InvalidAmountError extends DomainError {
  constructor(message: string) {
    super(`Validación monetaria fallida: ${message}`);
  }
}

export class AccountNotFoundError extends DomainError {
  constructor(accountId: string) {
    super(`La cuenta con ID '${accountId}' no fue encontrada o no existe.`);
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`El usuario con ID '${userId}' no fue encontrado o no existe.`);
  }
}