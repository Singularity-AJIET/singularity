import { verifyJwt } from '../utils/crypto.js';
const JWT_SECRET = process.env.JWT_SECRET || process.env.EVENT_SIGNING_KEY || 'default-jwt-super-secret-key-999';
/**
 * Middleware to require valid Admin JWT authentication.
 */
export function requireAdminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ detail: "Authorization token required (Bearer token)." });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = verifyJwt(token, JWT_SECRET);
        if (!decoded || !decoded.sub) {
            res.status(401).json({ detail: "Invalid or expired authorization token." });
            return;
        }
        // Attach authentication context to request
        req.adminId = Number(decoded.sub);
        req.adminUsername = String(decoded.username);
        next();
    }
    catch (err) {
        res.status(401).json({ detail: "Authentication failed." });
    }
}
