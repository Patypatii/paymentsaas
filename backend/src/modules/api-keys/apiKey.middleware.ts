import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from './apiKey.service';
import { AppError, ErrorCode } from '../../common/constants/errors';

declare global {
  namespace Express {
    interface Request {
      merchantId?: string;
      merchant?: any;
    }
  }
}

export async function apiKeyMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing API key', 401);
    }

    const apiKey = authHeader.substring(7);
    const validation = await ApiKeyService.validateKey(apiKey);

    req.merchantId = validation.merchantId;
    req.merchant = validation.merchant;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid API key', 401);
  }
}
