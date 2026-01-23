import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { jwtGuard } from '../auth/jwt.guard';

export function adminGuard(req: Request, res: Response, next: NextFunction): void {
  // First verify JWT
  jwtGuard(req, res, () => {
    // Then check if user is admin
    if (!req.user || req.user.type !== 'admin') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Admin access required', 403);
    }
    next();
  });
}
