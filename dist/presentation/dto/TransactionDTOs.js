"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalFundsSchema = exports.DepositFundsSchema = exports.TransferMoneySchema = void 0;
const zod_1 = require("zod");
/**
 * Esquema de validación para la ejecución de una transferencia bancaria.
 */
exports.TransferMoneySchema = zod_1.z.object({
    sourceAccountId: zod_1.z
        .uuid({ error: 'ID de cuenta de origen debe ser un UUID válido' }),
    destinationAccountId: zod_1.z
        .uuid({ error: 'ID de cuenta de destino debe ser un UUID válido' }),
    amount: zod_1.z
        .number({ error: 'El monto es requerido' })
        .positive('El monto a transferir debe ser un número estrictamente mayor a cero'),
    description: zod_1.z
        .string()
        .max(100, 'La descripción no puede exceder los 100 caracteres')
        .optional(),
});
exports.DepositFundsSchema = zod_1.z.object({
    accountId: zod_1.z.uuid({ error: 'ID de cuenta debe ser un UUID válido' }),
    amount: zod_1.z
        .number({ error: 'El monto es requerido' })
        .positive('El monto a depositar debe ser un número estrictamente mayor a cero'),
});
exports.WithdrawalFundsSchema = zod_1.z.object({
    accountId: zod_1.z.uuid({ error: 'ID de cuenta debe ser un UUID válido' }),
    amount: zod_1.z
        .number({ error: 'El monto es requerido' })
        .positive('El monto a retirar debe ser un número estrictamente mayor a cero'),
});
//# sourceMappingURL=TransactionDTOs.js.map