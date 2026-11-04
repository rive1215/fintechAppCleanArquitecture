import { z } from 'zod';
/**
 * Esquema de validación para el registro de un nuevo usuario en la API.
 */
export declare const RegisterUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
/**
 * Esquema de validación para el inicio de sesión.
 */
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
//# sourceMappingURL=AuthDTOs.d.ts.map