"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAccountOutputDTO = toAccountOutputDTO;
/**
 * Proyecta una Account de dominio a DTO de salida.
 * Tras persistencia, id y createdAt deben existir.
 */
function toAccountOutputDTO(account) {
    if (account.id === undefined || account.createdAt === undefined) {
        throw new Error("La cuenta persistida es inconsistente: faltan id o createdAt.");
    }
    return {
        id: account.id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        status: account.status,
        userId: account.userId,
        createdAt: account.createdAt,
    };
}
//# sourceMappingURL=AccountDTOs.js.map