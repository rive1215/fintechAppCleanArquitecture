import { UserRepository } from "../domain/repositories/Repositories";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { TokenService } from "../domain/services/TokenService";
import { InvalidCredentialsError } from "../domain/exceptions/UserError";
import { LoginInputDTO, LoginOutputDTO } from "./dto/AuthDTOs";

/**
 * Caso de uso: autenticación por email/password y emisión de JWT.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const credentialsMatch = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!credentialsMatch) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
