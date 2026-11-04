import { TokenService, TokenPayload } from '../../domain/services/TokenService';
/**
 * Adaptador de Infraestructura que implementa la firma y verificación de JWT.
 */
export declare class JwtTokenService implements TokenService {
    private readonly secretKey;
    private readonly expiresIn;
    constructor();
    generateToken(payload: TokenPayload): string;
    verifyToken(token: string): TokenPayload;
}
//# sourceMappingURL=JwtTokenService.d.ts.map