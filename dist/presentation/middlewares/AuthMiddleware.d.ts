import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../domain/services/TokenService';
/**
 * Extensión de la interfaz de Request de Express para incluir la identidad del usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
export declare class AuthMiddleware {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    handle: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=AuthMiddleware.d.ts.map