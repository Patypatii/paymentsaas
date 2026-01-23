import crypto from 'crypto';
import { getRedisClient } from '../../config/redis';
import { logger } from './logger';

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours

/**
 * Generate idempotency key from request
 */
export function generateIdempotencyKey(
  merchantId: string,
  method: string,
  path: string,
  body: any
): string {
  const payload = JSON.stringify({ merchantId, method, path, body });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Check if request is duplicate (idempotency check)
 */
export async function checkIdempotency(key: string): Promise<{
  isDuplicate: boolean;
  cachedResponse?: any;
}> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(`idempotency:${key}`);
    
    if (cached) {
      return {
        isDuplicate: true,
        cachedResponse: JSON.parse(cached),
      };
    }
    
    return { isDuplicate: false };
  } catch (error) {
    logger.error('Idempotency check failed', error);
    // Fail open - allow request to proceed
    return { isDuplicate: false };
  }
}

/**
 * Store idempotency result
 */
export async function storeIdempotency(
  key: string,
  response: any
): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.setEx(
      `idempotency:${key}`,
      IDEMPOTENCY_TTL,
      JSON.stringify(response)
    );
  } catch (error) {
    logger.error('Failed to store idempotency result', error);
    // Non-critical error, don't throw
  }
}
