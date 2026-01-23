import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Generate a secure random API key
 */
export function generateApiKey(prefix: string = 'pk_'): string {
  const randomBytes = crypto.randomBytes(24);
  const key = randomBytes.toString('base64url');
  return `${prefix}${key}`;
}

/**
 * Hash an API key using bcrypt
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Verify an API key against its hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

/**
 * Generate HMAC-SHA256 signature
 */
export function generateHmacSignature(
  payload: string,
  secret: string,
  timestamp: string
): string {
  const message = `${timestamp}${payload}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Verify HMAC-SHA256 signature
 */
export function verifyHmacSignature(
  signature: string,
  payload: string,
  secret: string,
  timestamp: string
): boolean {
  const expectedSignature = generateHmacSignature(payload, secret, timestamp);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
