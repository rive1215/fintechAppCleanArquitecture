"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const UserMapper_1 = require("../mappers/UserMapper");
class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(user) {
        const data = UserMapper_1.UserMapper.toPersistence(user);
        const prismaUser = await this.prisma.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email,
                passwordHash: user.passwordHash,
                fullName: user.fullName,
            },
            create: data,
        });
        return UserMapper_1.UserMapper.toDomain(prismaUser);
    }
    async findById(id) {
        const prismaUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!prismaUser)
            return null;
        return UserMapper_1.UserMapper.toDomain(prismaUser);
    }
    async findByEmail(email) {
        const prismaUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!prismaUser)
            return null;
        return UserMapper_1.UserMapper.toDomain(prismaUser);
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=PrismaUserRepository.js.map