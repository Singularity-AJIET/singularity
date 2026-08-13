 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/crypto.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.EVENT_SIGNING_KEY || 'default-jwt-super-secret-key-999';

export interface AuthenticatedRequest extends Request {
  adminId?: number;
  adminUsername?: string;
  adminRole?: string; // 'superadmin' | 'admin' | 'volunteer'
}

/**
 * Shared token verification helper.
 * Returns the decoded payload or null if invalid.
 */
function verifyToken(req: Request, res: Response): any | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ detail: "Authorization token required (Bearer token)." });
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyJwt(token, JWT_SECRET);

  if (!decoded || !decoded.sub) {
    res.status(401).json({ detail: "Invalid or expired authorization token." });
    return null;
  }

  return decoded;
}

/**
 * Middleware: requires ANY valid admin token (superadmin, admin, or volunteer).
 * Used for: scanner, claims execution, QR pass granting.
 */
export function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  const decoded = verifyToken(req, res);
  if (!decoded) return;

  (req as AuthenticatedRequest).adminId = decoded.sub;
  (req as AuthenticatedRequest).adminUsername = decoded.username;
  (req as AuthenticatedRequest).adminRole = decoded.role || 'admin';
  next();
}

/**
 * Middleware: requires admin or superadmin token (blocks volunteers).
 * Used for: registration, claims report, counter management, settings.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const decoded = verifyToken(req, res);
  if (!decoded) return;

  const role = decoded.role || 'admin';

  if (role === 'volunteer') {
    res.status(403).json({ detail: "Access denied. Admin or Superadmin role required." });
    return;
  }

  (req as AuthenticatedRequest).adminId = decoded.sub;
  (req as AuthenticatedRequest).adminUsername = decoded.username;
  (req as AuthenticatedRequest).adminRole = role;
  next();
}

/**
 * Middleware: requires superadmin token only.
 * Used for: creating/deleting admin accounts, changing other users' passwords.
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const decoded = verifyToken(req, res);
  if (!decoded) return;

  const role = decoded.role || 'admin';

  if (role !== 'superadmin') {
    res.status(403).json({ detail: "Access denied. Superadmin role required." });
    return;
  }

  (req as AuthenticatedRequest).adminId = decoded.sub;
  (req as AuthenticatedRequest).adminUsername = decoded.username;
  (req as AuthenticatedRequest).adminRole = role;
  next();
}
