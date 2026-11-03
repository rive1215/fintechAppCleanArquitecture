import { UserRepository } from "../domain/repositories/Repositories";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { User } from "../domain/entities/User";
import { UserAlreadyExistsError } from "../domain/exceptions/UserError";
import { RegisterUserInputDTO, RegisterUserOutputDTO } from "./dto/AuthDTOs";

/**
 * Caso de uso: registro de un nuevo usuario autenticable.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInputDTO): Promise<RegisterUserOutputDTO> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash,
      fullName: input.name,
      createdAt: new Date(),
    });

    const saved = await this.userRepository.save(user);

    return {
      id: saved.id,
      email: saved.email,
      fullName: saved.fullName,
      createdAt: saved.createdAt,
    };
  }
}
