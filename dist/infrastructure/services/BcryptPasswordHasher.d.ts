import { PasswordHasher } from '../../domain/services/PasswordHasher';
/**
 * Adaptador de Infraestructura que implementa el servicio de hashing usando Bcrypt.
 */
export declare class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds;
    /**
     * @param saltRounds Factor de costo de Bcrypt (Work Factor). Valor recomendado por defecto: 10.
     */
    constructor(saltRounds?: number);
    hash(password: string): Promise<string>;
    compare(plainText: string, hash: string): Promise<boolean>;
}
//# sourceMappingURL=BcryptPasswordHasher.d.ts.map