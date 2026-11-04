"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPropValueError = exports.DomainError = void 0;
/**
 * Clase abstracta raíz para todas las violaciones de reglas de negocio.
 * Garantiza que nuestra capa central permanezca agnóstica de los protocolos de transporte (HTTP/WebSockets).
 */
class DomainError extends Error {
    constructor(message) {
        super(message);
        // Establecemos el nombre de la clase hija instanciada dinámicamente
        this.name = this.constructor.name;
        // Limpiamos la traza de la pila para omitir el constructor actual, facilitando el debug en V8
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DomainError = DomainError;
/**
 * Clase que se usará para la validación de los campos al momento de crear una instancia.
 */
class InvalidPropValueError extends DomainError {
}
exports.InvalidPropValueError = InvalidPropValueError;
//# sourceMappingURL=DomainError.js.map