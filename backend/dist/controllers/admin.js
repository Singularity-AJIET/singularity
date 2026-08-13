import { prisma } from '../services/db.js';
import { hashPassword, comparePassword, signJwt } from '../utils/crypto.js';
// Load JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.EVENT_SIGNING_KEY || 'default-jwt-super-secret-key-999';
const JWT_EXPIRY_SECONDS = 86400; // 24 Hours
/**
 * POST /api/admin/register
 * Registers a new administrative user.
 */
export async function registerAdmin(req, res, next) {
    try {
        const { username, password, name } = req.body;
        if (!username || !password) {
            res.status(400).json({ detail: "Fields 'username' and 'password' are required." });
            return;
        }
        const trimmedUsername = String(username).trim().toLowerCase();
        // Check if username already exists
        const existing = await prisma.admin.findUnique({
            where: { username: trimmedUsername }
        });
        if (existing) {
            res.status(400).json({ detail: "Username already exists." });
            return;
        }
        // Hash password and store
        const hashedPassword = hashPassword(String(password));
        const newAdmin = await prisma.admin.create({
            data: {
                username: trimmedUsername,
                password: hashedPassword,
                name: name ? String(name).trim() : null
            }
        });
        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: {
                id: newAdmin.id,
                username: newAdmin.username,
                name: newAdmin.name
            }
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/admin/login
 * Authenticates an admin and returns a JWT token.
 */
export async function loginAdmin(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ detail: "Fields 'username' and 'password' are required." });
            return;
        }
        const trimmedUsername = String(username).trim().toLowerCase();
        // Find admin by username
        const admin = await prisma.admin.findUnique({
            where: { username: trimmedUsername }
        });
        if (!admin) {
            res.status(401).json({ detail: "Invalid username or password." });
            return;
        }
        // Compare passwords
        const isValid = comparePassword(String(password), admin.password);
        if (!isValid) {
            res.status(401).json({ detail: "Invalid username or password." });
            return;
        }
        // Generate JWT token
        const tokenPayload = {
            sub: admin.id,
            username: admin.username,
            name: admin.name
        };
        const token = signJwt(tokenPayload, JWT_SECRET, JWT_EXPIRY_SECONDS);
        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name
            }
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/admin/me
 * Returns details of the currently authenticated admin.
 */
export async function getMe(req, res, next) {
    try {
        // If auth middleware is attached, we can access the parsed admin
        const adminId = req.adminId;
        if (!adminId) {
            res.status(401).json({ detail: "Unauthorized." });
            return;
        }
        const admin = await prisma.admin.findUnique({
            where: { id: adminId }
        });
        if (!admin) {
            res.status(401).json({ detail: "Admin user not found." });
            return;
        }
        res.json({
            id: admin.id,
            username: admin.username,
            name: admin.name
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/admin
 * Returns the list of all administrator accounts.
 */
export async function listAdmins(req, res, next) {
    try {
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                createdAt: true
            },
            orderBy: { username: 'asc' }
        });
        res.json(admins);
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/admin/:id/password
 * Updates an admin's password.
 */
export async function updateAdminPassword(req, res, next) {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
            res.status(400).json({ detail: "Field 'password' is required." });
            return;
        }
        const adminId = parseInt(id);
        if (isNaN(adminId)) {
            res.status(400).json({ detail: "Invalid admin ID format." });
            return;
        }
        const admin = await prisma.admin.findUnique({
            where: { id: adminId }
        });
        if (!admin) {
            res.status(404).json({ detail: "Admin user not found." });
            return;
        }
        // Hash and update password
        const hashedPassword = hashPassword(String(password));
        await prisma.admin.update({
            where: { id: adminId },
            data: { password: hashedPassword }
        });
        res.json({
            success: true,
            message: "Admin password updated successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * DELETE /api/admin/:id
 * Safely deletes an admin account.
 */
export async function deleteAdmin(req, res, next) {
    try {
        const { id } = req.params;
        const adminId = parseInt(id);
        if (isNaN(adminId)) {
            res.status(400).json({ detail: "Invalid admin ID format." });
            return;
        }
        const requesterId = req.adminId;
        if (requesterId === adminId) {
            res.status(400).json({ detail: "Self-deletion is not permitted." });
            return;
        }
        const admin = await prisma.admin.findUnique({
            where: { id: adminId }
        });
        if (!admin) {
            res.status(404).json({ detail: "Admin user not found." });
            return;
        }
        if (admin.username === 'admin') {
            res.status(400).json({ detail: "Cannot delete the primary root admin account." });
            return;
        }
        await prisma.admin.delete({
            where: { id: adminId }
        });
        res.json({
            success: true,
            message: "Admin account deleted successfully."
        });
    }
    catch (err) {
        next(err);
    }
}
