import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiKeyService } from '../api-keys/apiKey.service';
import { AppError, ErrorCode } from '../../common/constants/errors';

/**
 * Unified authentication guard that supports both JWT (Session) and API Keys.
 * Useful for endpoints that are accessed by both the Dashboard (JWT) and external APIs (API Keys).
 */
export async function flexibleAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
    }

    const token = authHeader.substring(7);

    // 1. Try to validate as JWT (Session) first
    try {
        const payload = AuthService.verifyToken(token);
        if (payload && payload.type === 'merchant') {
            req.user = payload;
            return next();
        }
    } catch (jwtError) {
        // If not a valid JWT, continue to check if it's an API Key
    }

    // 2. Try to validate as API Key
    try {
        const validation = await ApiKeyService.validateKey(token);
        if (validation) {
            req.merchantId = validation.merchantId;
            req.merchant = validation.merchant;
            return next();
        }
    } catch (apiKeyError) {
        // Both failed
    }

    next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid authentication session or API key', 401));
}
