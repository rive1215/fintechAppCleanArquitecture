import { PrismaClient } from '../../generated/prisma/client';
import { UserRepository } from '../../domain/repositories/Repositories';
import { User } from '../../domain/entities/User';
export declare class PrismaUserRepository implements UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    save(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map