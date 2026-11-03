import { Decimal } from 'decimal.js';
import { Account as PrismaAccount, Prisma } from '../../generated/prisma/client';
import { Account } from '../../domain/entities/Account';

export class AccountMapper {
  /**
   * Convierte un registro de infraestructura a una entidad de dominio puro
   */
  public static toDomain(prismaAccount: PrismaAccount): Account {
    return Account.create({
      id: prismaAccount.id,
      accountNumber: prismaAccount.accountNumber,
      balance: new Decimal(prismaAccount.balance.toString()),
      userId: prismaAccount.userId,
      status: prismaAccount.status,
      createdAt: prismaAccount.createdAt,
    });
  }

  /**
   * Convierte una entidad de dominio a la estructura requerida por Prisma.
   * Con exactOptionalPropertyTypes, los opcionales solo se incluyen si tienen valor.
   */
  public static toPersistence(account: Account): Prisma.AccountUncheckedCreateInput {
    const data: Prisma.AccountUncheckedCreateInput = {
      accountNumber: account.accountNumber,
      balance: account.balance,
      userId: account.userId,
      status: account.status,
    };

    if (account.id !== undefined) {
      data.id = account.id;
    }
    if (account.createdAt !== undefined) {
      data.createdAt = account.createdAt;
    }

    return data;
  }
}
