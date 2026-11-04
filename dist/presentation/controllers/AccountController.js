"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
class AccountController {
    createAccountUseCase;
    getUserAccountsUseCase;
    getBalanceUseCase;
    freezeAccountUseCase;
    unfreezeAccountUseCase;
    constructor(createAccountUseCase, getUserAccountsUseCase, getBalanceUseCase, freezeAccountUseCase, unfreezeAccountUseCase) {
        this.createAccountUseCase = createAccountUseCase;
        this.getUserAccountsUseCase = getUserAccountsUseCase;
        this.getBalanceUseCase = getBalanceUseCase;
        this.freezeAccountUseCase = freezeAccountUseCase;
        this.unfreezeAccountUseCase = unfreezeAccountUseCase;
    }
    createAccount = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const newAccount = await this.createAccountUseCase.execute({
                userId,
                ...req.body,
            });
            res.status(201).json({
                status: 'success',
                data: newAccount,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getUserAccounts = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const accounts = await this.getUserAccountsUseCase.execute(userId);
            res.status(200).json({
                status: 'success',
                data: accounts,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getBalance = async (req, res, next) => {
        try {
            const accountId = req.params.accountId;
            if (typeof accountId !== 'string' || accountId.length === 0) {
                res.status(400).json({
                    status: 'fail',
                    code: 'VALIDATION_ERROR',
                    message: 'El parámetro accountId es requerido.',
                });
                return;
            }
            const account = await this.getBalanceUseCase.execute({ accountId });
            res.status(200).json({
                status: 'success',
                data: account,
            });
        }
        catch (error) {
            next(error);
        }
    };
    freeze = async (req, res, next) => {
        try {
            const accountId = req.params.accountId;
            if (typeof accountId !== 'string' || accountId.length === 0) {
                res.status(400).json({
                    status: 'fail',
                    code: 'VALIDATION_ERROR',
                    message: 'El parámetro accountId es requerido.',
                });
                return;
            }
            const account = await this.freezeAccountUseCase.execute({ accountId });
            res.status(200).json({
                status: 'success',
                data: account,
            });
        }
        catch (error) {
            next(error);
        }
    };
    unfreeze = async (req, res, next) => {
        try {
            const accountId = req.params.accountId;
            if (typeof accountId !== 'string' || accountId.length === 0) {
                res.status(400).json({
                    status: 'fail',
                    code: 'VALIDATION_ERROR',
                    message: 'El parámetro accountId es requerido.',
                });
                return;
            }
            const account = await this.unfreezeAccountUseCase.execute({ accountId });
            res.status(200).json({
                status: 'success',
                data: account,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AccountController = AccountController;
//# sourceMappingURL=AccountController.js.map