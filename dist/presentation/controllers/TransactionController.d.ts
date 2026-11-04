import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';
import { TransferMoneyUseCase } from '../../use-cases/TransferMoneyUseCase';
import { DepositUseCase } from '../../use-cases/DepositUseCase';
import { WithdrawalUseCase } from '../../use-cases/WithdrawalUseCase';
import { GetTransactionHistoryUseCase } from '../../use-cases/GetTransactionHistoryUseCase';
export declare class TransactionController {
    private readonly transferMoneyUseCase;
    private readonly depositUseCase;
    private readonly withdrawalUseCase;
    private readonly getTransactionHistoryUseCase;
    constructor(transferMoneyUseCase: TransferMoneyUseCase, depositUseCase: DepositUseCase, withdrawalUseCase: WithdrawalUseCase, getTransactionHistoryUseCase: GetTransactionHistoryUseCase);
    transfer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    deposit: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    withdrawal: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getHistory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=TransactionController.d.ts.map