import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../src/use-cases/LoginUseCase';
import { UserRepository } from '../../src/domain/repositories/Repositories';
import { PasswordHasher } from '../../src/domain/services/PasswordHasher';
import { TokenService } from '../../src/domain/services/TokenService';
import { User } from '../../src/domain/entities/User';
import { InvalidCredentialsError } from '../../src/domain/exceptions/UserError';

describe('LoginUseCase', () => {
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let tokenService: TokenService;
  let useCase: LoginUseCase;

  const user = User.create({
    id: 'user-1',
    email: 'ana@bank.test',
    passwordHash: 'hashed-password',
    fullName: 'Ana Pérez',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    userRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };
    tokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
    };
    useCase = new LoginUseCase(userRepository, tokenService, passwordHasher);
  });

  it('Login Exitoso', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(passwordHasher.compare).mockResolvedValue(true);
    vi.mocked(tokenService.generateToken).mockReturnValue('jwt-token');

    const result = await useCase.execute({
      email: 'ana@bank.test',
      password: 'password123',
    });

    expect(tokenService.generateToken).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ana@bank.test',
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'ana@bank.test',
        fullName: 'Ana Pérez',
      },
    });
  });

  it('Credenciales Inválidas - usuario inexistente', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@bank.test', password: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('Credenciales Inválidas - password incorrecto', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(passwordHasher.compare).mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'ana@bank.test', password: 'wrong' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(tokenService.generateToken).not.toHaveBeenCalled();
  });
});
