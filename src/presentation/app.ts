import express, { Application } from 'express';
import cors from 'cors';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Adapters de Infraestructura
import { BcryptPasswordHasher } from '../infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from '../infrastructure/services/JwtTokenService';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { PrismaAccountRepository } from '../infrastructure/repositories/PrismaAccountRepository';
import { PrismaTransactionRepository } from '../infrastructure/repositories/PrismaTransactionRepository';

// Casos de Uso
import { RegisterUserUseCase } from '../use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../use-cases/LoginUseCase';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { GetUserAccountsUseCase } from '../use-cases/GetUserAccountsUseCase';
import { GetBalanceUseCase } from '../use-cases/GetBalanceUseCase';
import { FreezeAccountUseCase } from '../use-cases/FreezeAccountUseCase';
import { UnfreezeAccountUseCase } from '../use-cases/UnfreezeAccountUseCase';
import { TransferMoneyUseCase } from '../use-cases/TransferMoneyUseCase';
import { DepositUseCase } from '../use-cases/DepositUseCase';
import { WithdrawalUseCase } from '../use-cases/WithdrawalUseCase';
import { GetTransactionHistoryUseCase } from '../use-cases/GetTransactionHistoryUseCase';

// Controllers & Middlewares
import { AuthController } from './controllers/AuthController';
import { AccountController } from './controllers/AccountController';
import { TransactionController } from './controllers/TransactionController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { validateRequest } from './middlewares/validateRequest';
import { errorHandler } from './middlewares/ErrorHandler';

// DTO Schemas (capa de presentación)
import { RegisterUserSchema, LoginSchema } from './dto/AuthDTOs';
import {
  TransferMoneySchema,
  DepositFundsSchema,
  WithdrawalFundsSchema,
} from './dto/TransactionDTOs';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // 1. Base de datos (Infraestructura) — Prisma 7 requiere driver adapter
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida en el entorno.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  // 2. Servicios (Infraestructura)
  const passwordHasher = new BcryptPasswordHasher(10);
  const tokenService = new JwtTokenService();

  // 3. Repositorios (Infraestructura)
  const userRepository = new PrismaUserRepository(prisma);
  const accountRepository = new PrismaAccountRepository(prisma);
  const transactionRepository = new PrismaTransactionRepository(prisma);

  // 4. Casos de Uso (Aplicación)
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const loginUseCase = new LoginUseCase(userRepository, tokenService, passwordHasher);
  const createAccountUseCase = new CreateAccountUseCase(accountRepository, userRepository);
  const getUserAccountsUseCase = new GetUserAccountsUseCase(accountRepository);
  const getBalanceUseCase = new GetBalanceUseCase(accountRepository);
  const freezeAccountUseCase = new FreezeAccountUseCase(accountRepository);
  const unfreezeAccountUseCase = new UnfreezeAccountUseCase(accountRepository);
  const transferMoneyUseCase = new TransferMoneyUseCase(accountRepository);
  const depositUseCase = new DepositUseCase(accountRepository);
  const withdrawalUseCase = new WithdrawalUseCase(accountRepository);
  const getTransactionHistoryUseCase = new GetTransactionHistoryUseCase(transactionRepository);

  // 5. Controllers y middlewares (Presentación)
  const authController = new AuthController(registerUserUseCase, loginUseCase);
  const accountController = new AccountController(
    createAccountUseCase,
    getUserAccountsUseCase,
    getBalanceUseCase,
    freezeAccountUseCase,
    unfreezeAccountUseCase,
  );
  const transactionController = new TransactionController(
    transferMoneyUseCase,
    depositUseCase,
    withdrawalUseCase,
    getTransactionHistoryUseCase,
  );
  const authMiddleware = new AuthMiddleware(tokenService);

  // 6. Rutas públicas
  app.post('/api/auth/register', validateRequest(RegisterUserSchema), authController.register);
  app.post('/api/auth/login', validateRequest(LoginSchema), authController.login);

  // 7. Rutas protegidas — cuentas
  app.get('/api/accounts', authMiddleware.handle, accountController.getUserAccounts);
  app.post('/api/accounts', authMiddleware.handle, accountController.createAccount);
  app.get('/api/accounts/:accountId/balance', authMiddleware.handle, accountController.getBalance);
  app.patch('/api/accounts/:accountId/freeze', authMiddleware.handle, accountController.freeze);
  app.patch('/api/accounts/:accountId/unfreeze', authMiddleware.handle, accountController.unfreeze);

  // 8. Rutas protegidas — transacciones
  app.post(
    '/api/transactions/transfer',
    authMiddleware.handle,
    validateRequest(TransferMoneySchema),
    transactionController.transfer,
  );
  app.post(
    '/api/transactions/deposit',
    authMiddleware.handle,
    validateRequest(DepositFundsSchema),
    transactionController.deposit,
  );
  app.post(
    '/api/transactions/withdrawal',
    authMiddleware.handle,
    validateRequest(WithdrawalFundsSchema),
    transactionController.withdrawal,
  );
  app.get(
    '/api/transactions/history/:accountId',
    authMiddleware.handle,
    transactionController.getHistory,
  );

  // 9. Manejo global de errores
  app.use(errorHandler);

  return app;
}
