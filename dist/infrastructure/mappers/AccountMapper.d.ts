import { Account as PrismaAccount, Prisma } from '../../generated/prisma/client';
import { Account } from '../../domain/entities/Account';
export declare class AccountMapper {
    /**
     * Convierte un registro de infraestructura a una entidad de dominio puro
     */
    static toDomain(prismaAccount: PrismaAccount): Account;
    /**
     * Convierte una entidad de dominio a la estructura requerida por Prisma.
     * Con exactOptionalPropertyTypes, los opcionales solo se incluyen si tienen valor.
     */
    static toPersistence(account: Account): Prisma.AccountUncheckedCreateInput;
}
//# sourceMappingURL=AccountMapper.d.ts.map