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

export class AuthMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  public handle = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'fail',
        code: 'UNAUTHORIZED',
        message: 'Acceso denegado. Se requiere un Bearer Token válido en la cabecera Authorization.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'fail',
        code: 'UNAUTHORIZED',
        message: 'Acceso denegado. Se requiere un Bearer Token válido en la cabecera Authorization.',
      });
      return;
    }

    try {
      const payload = this.tokenService.verifyToken(token);
      req.user = payload;
      next();
    } catch {
      res.status(401).json({
        status: 'fail',
        code: 'INVALID_TOKEN',
        message: 'El token de autenticación provisto es inválido o ha expirado.',
      });
      return;
    }
  };
}
