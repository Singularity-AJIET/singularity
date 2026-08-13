import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    adminId?: number;
    adminUsername?: string;
}
/**
 * Middleware to require valid Admin JWT authentication.
 */
export declare function requireAdminAuth(req: Request, res: Response, next: NextFunction): void;
