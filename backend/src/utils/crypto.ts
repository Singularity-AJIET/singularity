/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ed from '@noble/ed25519';
import crypto from 'crypto';

// Setup Node.js shims for noble-ed25519 v2+
const sha512SyncShim = (...m: Uint8Array[]): Uint8Array => {
  const hash = crypto.createHash('sha512');
  for (const chunk of m) {
    hash.update(chunk);
  }
  return hash.digest();
};

ed.etc.sha512Sync = sha512SyncShim;
ed.etc.sha512Async = (...m: Uint8Array[]) => {
  return Promise.resolve(sha512SyncShim(...m));
};

export interface TokenPayload {
  p: string;         // participantId
  t: number | null;  // teamId (nullable)
  n: string;         // name
  e: number;         // expiry (Unix timestamp in seconds)
}

/**
 * Converts a hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim();
  if (cleanHex.length !== 64) {
    throw new Error('Ed25519 private key must be a 32-byte hex string (64 characters).');
  }
  return Uint8Array.from(Buffer.from(cleanHex, 'hex'));
}

/**
 * Signs a payload with Ed25519 and returns the token in format SNG1.<payload-b64url>.<sig-b64url>
 */
export async function signToken(payload: TokenPayload, privateKeyHex: string): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  const message = `SNG1.${payloadB64}`;
  const messageBytes = new TextEncoder().encode(message);
  
  const privateKeyBytes = hexToBytes(privateKeyHex);
  const signatureBytes = await ed.sign(messageBytes, privateKeyBytes);
  const sigB64 = Buffer.from(signatureBytes).toString('base64url');
  
  return `SNG1.${payloadB64}.${sigB64}`;
}

/**
 * Verifies an Ed25519 token, returns decoded payload if valid and not expired, otherwise null.
 */
export async function verifyToken(token: string, privateKeyHex: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'SNG1') {
      return null;
    }
    
    const payloadB64 = parts[1];
    const sigB64 = parts[2];
    const message = `SNG1.${payloadB64}`;
    const messageBytes = new TextEncoder().encode(message);
    
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const publicKeyBytes = await ed.getPublicKey(privateKeyBytes);
    
    const signatureBytes = Uint8Array.from(Buffer.from(sigB64, 'base64url'));
    
    const isValid = await ed.verify(signatureBytes, messageBytes, publicKeyBytes);
    if (!isValid) {
      return null;
    }
    
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr) as TokenPayload;
    
    // Check expiry
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.e && nowInSeconds > payload.e) {
      console.log(`Token expired: now=${nowInSeconds}, expiry=${payload.e}`);
      return null;
    }
    
    return payload;
  } catch (err) {
    console.error('Error verifying token:', err);
    return null;
  }
}

/**
 * Generates a random 32-byte hex private key for development fallback
 */
export function generateDevPrivateKey(): string {
  const bytes = ed.utils.randomPrivateKey();
  return Buffer.from(bytes).toString('hex');
}

/**
 * Hashes a password using crypto.scryptSync (format: salt:hash)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compares a plaintext password with a stored scrypt hash
 */
export function comparePassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (err) {
    return false;
  }
}

/**
 * Signs a payload to create a standard HS256 JWT token using native crypto HMAC
 */
export function signJwt(payload: any, secret: string, expiresInSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  
  const sHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const sPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${sHeader}.${sPayload}`)
    .digest('base64url');
    
  return `${sHeader}.${sPayload}.${signature}`;
}

/**
 * Verifies an HS256 JWT token using native crypto HMAC and returns its payload (or null if invalid/expired)
 */
export function verifyJwt(token: string, secret: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [sHeader, sPayload, signature] = parts;
    
    const verifySig = crypto
      .createHmac('sha256', secret)
      .update(`${sHeader}.${sPayload}`)
      .digest('base64url');
      
    if (signature !== verifySig) return null;
    
    const payload = JSON.parse(Buffer.from(sPayload, 'base64url').toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (err) {
    return null;
  }
}

let cachedSigningKey: string | null = null;
export function getSigningKey(): string {
  if (cachedSigningKey) return cachedSigningKey;
  
  const key = process.env.EVENT_SIGNING_KEY;
  if (key && key.trim().length === 64) {
    cachedSigningKey = key.trim();
    return cachedSigningKey;
  }
  
  console.warn('WARNING: EVENT_SIGNING_KEY environment variable is not defined or invalid (must be 64-character hex). Generating a temporary private key for signing.');
  const tempKey = generateDevPrivateKey();
  console.log(`Temporary Dev private key generated: ${tempKey}`);
  cachedSigningKey = tempKey;
  return cachedSigningKey;
}

