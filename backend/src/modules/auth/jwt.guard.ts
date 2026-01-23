import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { JWTPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function jwtGuard(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication failed', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    if (req.user.type === 'admin' && req.user.role && roles.includes(req.user.role)) {
      next();
      return;
    }

    throw new AppError(ErrorCode.UNAUTHORIZED, 'Insufficient permissions', 403);
  };
}
