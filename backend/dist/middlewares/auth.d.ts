import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    adminId?: number;
    adminUsername?: string;
    adminRole?: string;
}
/**
 * Middleware: requires ANY valid admin token (superadmin, admin, or volunteer).
 * Used for: scanner, claims execution, QR pass granting.
 */
export declare function requireAnyAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware: requires admin or superadmin token (blocks volunteers).
 * Used for: registration, claims report, counter management, settings.
 */
export declare function requireAdminAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware: requires superadmin token only.
 * Used for: creating/deleting admin accounts, changing other users' passwords.
 */
export declare function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void;
