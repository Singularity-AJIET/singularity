 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.js';
import { hashPassword, comparePassword, signJwt } from '../utils/crypto.js';

// Load JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.EVENT_SIGNING_KEY || 'default-jwt-super-secret-key-999';
const JWT_EXPIRY_SECONDS = 86400; // 24 Hours

const VALID_ROLES = ['superadmin', 'admin', 'volunteer'];

/**
 * POST /api/admin/register
 * Registers a new administrative user.
 * Requires superadmin — only superadmins can create new accounts.
 */
export async function registerAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ detail: "Fields 'username' and 'password' are required." });
      return;
    }

    const assignedRole = (role && VALID_ROLES.includes(String(role).toLowerCase()))
      ? String(role).toLowerCase()
      : 'admin';

    const trimmedUsername = String(username).trim().toLowerCase();

    const existing = await prisma.admin.findUnique({ where: { username: trimmedUsername } });
    if (existing) {
      res.status(400).json({ detail: "Username already exists." });
      return;
    }

    const hashedPassword = hashPassword(String(password));
    const newAdmin = await prisma.admin.create({
      data: {
        username: trimmedUsername,
        password: hashedPassword,
        name: name ? String(name).trim() : null,
        role: assignedRole
      }
    });

    res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/login
 * Authenticates an admin and returns a JWT token containing the role.
 */
export async function loginAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ detail: "Fields 'username' and 'password' are required." });
      return;
    }

    const trimmedUsername = String(username).trim().toLowerCase();

    const admin = await prisma.admin.findUnique({ where: { username: trimmedUsername } });
    if (!admin) {
      res.status(401).json({ detail: "Invalid username or password." });
      return;
    }

    const isValid = comparePassword(String(password), admin.password);
    if (!isValid) {
      res.status(401).json({ detail: "Invalid username or password." });
      return;
    }

    // Embed role in JWT payload so middleware can verify without a DB lookup
    const tokenPayload = {
      sub: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    };

    const token = signJwt(tokenPayload, JWT_SECRET, JWT_EXPIRY_SECONDS);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/me
 * Returns details of the currently authenticated admin, including role.
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).adminId;

    if (!adminId) {
      res.status(401).json({ detail: "Unauthorized." });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      res.status(401).json({ detail: "Admin user not found." });
      return;
    }

    res.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin
 * Returns the list of all administrator accounts (admin + superadmin only).
 */
export async function listAdmins(req: Request, res: Response, next: NextFunction) {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true },
      orderBy: { username: 'asc' }
    });
    res.json(admins);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/:id/password
 * Updates a user's password.
 * Rules:
 *   - Superadmin: can change anyone's password
 *   - Admin/Volunteer: can only change their OWN password
 */
export async function updateAdminPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ detail: "Field 'password' is required." });
      return;
    }

    const targetId = parseInt(id);
    if (isNaN(targetId)) {
      res.status(400).json({ detail: "Invalid admin ID format." });
      return;
    }

    const requesterId = (req as any).adminId;
    const requesterRole = (req as any).adminRole || 'admin';

    // Non-superadmins can only change their own password
    if (requesterRole !== 'superadmin' && requesterId !== targetId) {
      res.status(403).json({ detail: "Access denied. You can only change your own password." });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { id: targetId } });
    if (!admin) {
      res.status(404).json({ detail: "Admin user not found." });
      return;
    }

    const hashedPassword = hashPassword(String(password));
    await prisma.admin.update({ where: { id: targetId }, data: { password: hashedPassword } });

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/:id
 * Deletes an admin account. Superadmin only.
 */
export async function deleteAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const targetId = parseInt(id);

    if (isNaN(targetId)) {
      res.status(400).json({ detail: "Invalid admin ID format." });
      return;
    }

    const requesterId = (req as any).adminId;
    if (requesterId === targetId) {
      res.status(400).json({ detail: "Self-deletion is not permitted." });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { id: targetId } });
    if (!admin) {
      res.status(404).json({ detail: "Admin user not found." });
      return;
    }

    if (admin.role === 'superadmin') {
      // Count how many superadmins exist — don't allow deleting the last one
      const superadminCount = await prisma.admin.count({ where: { role: 'superadmin' } });
      if (superadminCount <= 1) {
        res.status(400).json({ detail: "Cannot delete the last superadmin account." });
        return;
      }
    }

    await prisma.admin.delete({ where: { id: targetId } });

    res.json({ success: true, message: "Account deleted successfully." });
  } catch (err) {
    next(err);
  }
}
