import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../../use-cases/LoginUseCase';
export declare class AuthController {
    private readonly registerUserUseCase;
    private readonly loginUseCase;
    constructor(registerUserUseCase: RegisterUserUseCase, loginUseCase: LoginUseCase);
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map