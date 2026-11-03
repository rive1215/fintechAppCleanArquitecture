import jwt, { type SignOptions } from 'jsonwebtoken';
import { TokenService, TokenPayload } from '../../domain/services/TokenService';

/**
 * Adaptador de Infraestructura que implementa la firma y verificación de JWT.
 */
export class JwtTokenService implements TokenService {
  private readonly secretKey: string;
  private readonly expiresIn: NonNullable<SignOptions['expiresIn']>;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'default_secret';
    this.expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as NonNullable<SignOptions['expiresIn']>;
  }

  generateToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn,
      algorithm: 'HS256',
    };

    return jwt.sign(payload, this.secretKey, options);
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey) as jwt.JwtPayload & TokenPayload;
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch {
      throw new Error('Token de autenticación inválido o expirado.');
    }
  }
}
