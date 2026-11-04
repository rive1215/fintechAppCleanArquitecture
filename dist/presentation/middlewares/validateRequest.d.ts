import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
export declare const validateRequest: (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateRequest.d.ts.map