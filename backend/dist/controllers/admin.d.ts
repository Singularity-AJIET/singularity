import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/admin/register
 * Registers a new administrative user.
 */
export declare function registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/admin/login
 * Authenticates an admin and returns a JWT token.
 */
export declare function loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/admin/me
 * Returns details of the currently authenticated admin.
 */
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/admin
 * Returns the list of all administrator accounts.
 */
export declare function listAdmins(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/admin/:id/password
 * Updates an admin's password.
 */
export declare function updateAdminPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/admin/:id
 * Safely deletes an admin account.
 */
export declare function deleteAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
