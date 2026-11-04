"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const FinancialError_1 = require("../exceptions/FinancialError");
const DomainError_1 = require("../exceptions/DomainError");
class Account {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        if (props.balance.isNegative()) {
            throw new DomainError_1.InvalidPropValueError('Una cuenta no puede ser inicializada con saldo negativo.');
        }
        if (props.createdAt === undefined) {
            props.createdAt = new Date();
        }
        return new Account(props);
    }
    // getters
    get id() { return this.props.id; }
    get accountNumber() { return this.props.accountNumber; }
    get balance() { return this.props.balance; }
    get userId() { return this.props.userId; }
    get status() { return this.props.status; }
    get createdAt() { return this.props.createdAt; }
    // Comportamientos de dominio
    deposit(amount) {
        if (amount.lte(0)) {
            throw new FinancialError_1.InvalidAmountError("El monto del depósito debe ser estrictamente mayor a cero.");
        }
        if (this.props.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(this.id);
        }
        this.props.balance = this.props.balance.plus(amount);
    }
    withdraw(amount) {
        if (amount.lte(0)) {
            throw new FinancialError_1.InvalidAmountError("El monto del retiro debe ser estrictamente mayor a cero.");
        }
        if (this.props.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(this.id);
        }
        if (this.props.balance.lessThan(amount)) {
            throw new FinancialError_1.InsufficientBalanceError(this.id);
        }
        this.props.balance = this.props.balance.minus(amount);
    }
    freeze() {
        if (this.props.status === "FROZEN") {
            throw new DomainError_1.InvalidPropValueError("La cuenta ya se encuentra congelada.");
        }
        this.props.status = "FROZEN";
    }
    unfreeze() {
        if (this.props.status === "ACTIVE") {
            throw new DomainError_1.InvalidPropValueError("La cuenta ya se encuentra activa.");
        }
        this.props.status = "ACTIVE";
    }
}
exports.Account = Account;
//# sourceMappingURL=Account.js.map