import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../src/use-cases/RegisterUserUseCase';
import { UserRepository } from '../../src/domain/repositories/Repositories';
import { PasswordHasher } from '../../src/domain/services/PasswordHasher';
import { User } from '../../src/domain/entities/User';
import { UserAlreadyExistsError } from '../../src/domain/exceptions/UserError';

describe('RegisterUserUseCase', () => {
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let useCase: RegisterUserUseCase;

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
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('Registro Exitoso', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(passwordHasher.hash).mockResolvedValue('hashed-password');
    vi.mocked(userRepository.save).mockImplementation(async (user) => user);

    const result = await useCase.execute({
      name: 'Ana Pérez',
      email: 'ana@bank.test',
      password: 'password123',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(result.email).toBe('ana@bank.test');
    expect(result.fullName).toBe('Ana Pérez');
    expect(result.id).toBeDefined();
  });

  it('Usuario Ya Existe', async () => {
    const existing = User.create({
      id: 'user-1',
      email: 'ana@bank.test',
      passwordHash: 'hash',
      fullName: 'Ana Pérez',
      createdAt: new Date(),
    });
    vi.mocked(userRepository.findByEmail).mockResolvedValue(existing);

    await expect(
      useCase.execute({
        name: 'Ana Pérez',
        email: 'ana@bank.test',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
