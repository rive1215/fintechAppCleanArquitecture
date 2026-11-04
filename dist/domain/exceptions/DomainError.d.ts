/**
 * Clase abstracta raíz para todas las violaciones de reglas de negocio.
 * Garantiza que nuestra capa central permanezca agnóstica de los protocolos de transporte (HTTP/WebSockets).
 */
export declare abstract class DomainError extends Error {
    constructor(message: string);
}
/**
 * Clase que se usará para la validación de los campos al momento de crear una instancia.
 */
export declare class InvalidPropValueError extends DomainError {
}
//# sourceMappingURL=DomainError.d.ts.map