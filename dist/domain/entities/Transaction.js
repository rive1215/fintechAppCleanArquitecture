"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = exports.Withdrawal = exports.Deposit = exports.Transaction = void 0;
const DomainError_1 = require("../exceptions/DomainError");
class Transaction {
    props;
    constructor(props) {
        this.props = props;
    }
    static validateAmount(props, errorMessage) {
        if (props.amount.lte(0)) {
            throw new DomainError_1.InvalidPropValueError(errorMessage);
        }
    }
    // Getters
    get id() { return this.props.id; }
    get amount() { return this.props.amount; }
    get status() { return this.props.status; }
    get description() { return this.props.description; }
    get createdAt() { return this.props.createdAt; }
    markAsCompleted() {
        this.props.status = "COMPLETED";
    }
    markAsFailed() {
        this.props.status = "FAILED";
    }
}
exports.Transaction = Transaction;
class Deposit extends Transaction {
    destinationAccountId;
    constructor(props) {
        super(props);
        this.destinationAccountId = props.destinationAccountId;
    }
    static create(props) {
        Transaction.validateAmount(props, "El monto del depósito debe ser mayor que cero.");
        return new Deposit(props);
    }
    // getter
    get destinationAccount() { return this.destinationAccountId; } // deposit1.destinationAccount
}
exports.Deposit = Deposit;
class Withdrawal extends Transaction {
    sourceAccountId;
    constructor(props) {
        super(props);
        this.sourceAccountId = props.sourceAccountId;
    }
    static create(props) {
        Transaction.validateAmount(props, "El monto del retiro debe ser mayor que cero.");
        return new Withdrawal(props);
    }
    // getter
    get sourceAccount() { return this.sourceAccountId; }
}
exports.Withdrawal = Withdrawal;
class Transfer extends Transaction {
    sourceAccountId;
    destinationAccountId;
    constructor(props) {
        super(props);
        this.sourceAccountId = props.sourceAccountId;
        this.destinationAccountId = props.destinationAccountId;
    }
    static create(props) {
        if (props.sourceAccountId === props.destinationAccountId) {
            throw new DomainError_1.InvalidPropValueError("La cuenta de origen y destino no pueden ser la misma.");
        }
        Transaction.validateAmount(props, "El monto de la transferencia debe ser mayor que cero.");
        return new Transfer(props);
    }
    get sourceAccount() { return this.sourceAccountId; }
    get destinationAccount() { return this.destinationAccountId; }
}
exports.Transfer = Transfer;
//# sourceMappingURL=Transaction.js.map