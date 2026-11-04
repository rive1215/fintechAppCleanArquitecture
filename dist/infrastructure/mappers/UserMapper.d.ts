import { User as PrismaUser, Prisma } from '../../generated/prisma/client';
import { User } from '../../domain/entities/User';
export declare class UserMapper {
    /**
     * Convierte un registro de infraestructura a una entidad de dominio puro
     */
    static toDomain(prismaUser: PrismaUser): User;
    /**
     * Convierte una entidad de dominio a la estructura requerida por Prisma
     */
    static toPersistence(user: User): Prisma.UserUncheckedCreateInput;
}
//# sourceMappingURL=UserMapper.d.ts.map