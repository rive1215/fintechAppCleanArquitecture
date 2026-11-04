import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';
import { GetUserAccountsUseCase } from '../../use-cases/GetUserAccountsUseCase';
import { CreateAccountUseCase } from '../../use-cases/CreateAccountUseCase';
import { GetBalanceUseCase } from '../../use-cases/GetBalanceUseCase';
import { FreezeAccountUseCase } from '../../use-cases/FreezeAccountUseCase';
import { UnfreezeAccountUseCase } from '../../use-cases/UnfreezeAccountUseCase';
export declare class AccountController {
    private readonly createAccountUseCase;
    private readonly getUserAccountsUseCase;
    private readonly getBalanceUseCase;
    private readonly freezeAccountUseCase;
    private readonly unfreezeAccountUseCase;
    constructor(createAccountUseCase: CreateAccountUseCase, getUserAccountsUseCase: GetUserAccountsUseCase, getBalanceUseCase: GetBalanceUseCase, freezeAccountUseCase: FreezeAccountUseCase, unfreezeAccountUseCase: UnfreezeAccountUseCase);
    createAccount: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getUserAccounts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getBalance: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    freeze: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    unfreeze: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=AccountController.d.ts.map