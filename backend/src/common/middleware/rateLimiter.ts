import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../../config/redis';
import { config } from '../../config/env';
import { AppError, ErrorCode } from '../constants/errors';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || config.rateLimit.windowMs;
  const maxRequests = options.maxRequests || config.rateLimit.maxRequests;
  const keyGenerator = options.keyGenerator || ((req: Request) => {
    // Default: rate limit by IP
    return req.ip || 'unknown';
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = await getRedisClient();
      const key = `rate_limit:${keyGenerator(req)}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      const ttl = await redis.ttl(key);
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());

      if (current > maxRequests) {
        logger.warn('Rate limit exceeded', {
          key,
          current,
          max: maxRequests,
          ip: req.ip,
        });
        throw new AppError(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded',
          429
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Rate limiter error', error);
      // Fail open - allow request to proceed
      next();
    }
  };
}
