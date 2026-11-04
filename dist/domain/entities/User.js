"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const DomainError_1 = require("../exceptions/DomainError");
class User {
    props;
    // Constructor privado: Fuerza a los desarrolladores a usar el método estático create()
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        // Invariante de Dominio: Un usuario no puede existir con un correo mal formado
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(props.email)) {
            throw new DomainError_1.InvalidPropValueError('El formato del correo electrónico es estructuralmente inválido.');
        }
        return new User(props);
    }
    // Getters puros. Exponemos la información sin permitir que la muten desde afuera.
    get id() { return this.props.id; }
    get email() { return this.props.email; }
    get passwordHash() { return this.props.passwordHash; }
    get fullName() { return this.props.fullName; }
    get createdAt() { return this.props.createdAt; }
}
exports.User = User;
//# sourceMappingURL=User.js.map