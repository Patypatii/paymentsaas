import { Request, Response, NextFunction } from 'express';
import { verifyHmacSignature } from '../utils/crypto';
import { config } from '../../config/env';
import { AppError, ErrorCode } from '../constants/errors';
import { securityConfig } from '../../config/security';

export function hmacVerifier(req: Request, _res: Response, next: NextFunction): void {
  const signature = req.headers['x-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;

  if (!signature || !timestamp) {
    throw new AppError(
      ErrorCode.INVALID_SIGNATURE,
      'Missing X-Signature or X-Timestamp header',
      401
    );
  }

  // Check timestamp validity
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  const tolerance = securityConfig.hmac.timestampTolerance;

  if (Math.abs(now - requestTime) > tolerance) {
    throw new AppError(
      ErrorCode.EXPIRED_TIMESTAMP,
      'Request timestamp is too old or too far in the future',
      401
    );
  }

  // Verify signature
  const payload = JSON.stringify(req.body);
  const isValid = verifyHmacSignature(
    signature,
    payload,
    config.api.hmacSecret,
    timestamp
  );

  if (!isValid) {
    throw new AppError(
      ErrorCode.INVALID_SIGNATURE,
      'Invalid request signature',
      401
    );
  }

  next();
}
