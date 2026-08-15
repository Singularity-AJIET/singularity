import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/admin/register
 * Registers a new administrative user.
 * Requires superadmin — only superadmins can create new accounts.
 */
export declare function registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/admin/login
 * Authenticates an admin and returns a JWT token containing the role.
 */
export declare function loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/admin/me
 * Returns details of the currently authenticated admin, including role.
 */
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/admin
 * Returns the list of all administrator accounts (admin + superadmin only).
 */
export declare function listAdmins(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/admin/:id/password
 * Updates a user's password.
 * Rules:
 *   - Superadmin: can change anyone's password
 *   - Admin/Volunteer: can only change their OWN password
 */
export declare function updateAdminPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/admin/:id
 * Deletes an admin account. Superadmin only.
 */
export declare function deleteAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
