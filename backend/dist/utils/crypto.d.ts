export interface TokenPayload {
    p: string;
    t: number | null;
    n: string;
    e: number;
}
/**
 * Signs a payload with Ed25519 and returns the token in format SNG1.<payload-b64url>.<sig-b64url>
 */
export declare function signToken(payload: TokenPayload, privateKeyHex: string): Promise<string>;
/**
 * Verifies an Ed25519 token, returns decoded payload if valid and not expired, otherwise null.
 */
export declare function verifyToken(token: string, privateKeyHex: string): Promise<TokenPayload | null>;
/**
 * Generates a random 32-byte hex private key for development fallback
 */
export declare function generateDevPrivateKey(): string;
/**
 * Hashes a password using crypto.scryptSync (format: salt:hash)
 */
export declare function hashPassword(password: string): string;
/**
 * Compares a plaintext password with a stored scrypt hash
 */
export declare function comparePassword(password: string, storedHash: string): boolean;
/**
 * Signs a payload to create a standard HS256 JWT token using native crypto HMAC
 */
export declare function signJwt(payload: any, secret: string, expiresInSeconds: number): string;
/**
 * Verifies an HS256 JWT token using native crypto HMAC and returns its payload (or null if invalid/expired)
 */
export declare function verifyJwt(token: string, secret: string): any | null;
export declare function getSigningKey(): string;
