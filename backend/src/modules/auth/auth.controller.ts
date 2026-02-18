import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6),
}).refine(data => data.email || data.username, {
  message: 'Either email or username is required',
  path: ['email'],
});

export const authController = {
  async loginMerchant(req: Request, res: Response, next: import('express').NextFunction): Promise<void> {
    try {
      const { email, username, password } = loginSchema.parse(req.body);
      const identifier = (email || username)!;
      const result = await AuthService.authenticateMerchant(identifier, password);

      res.json({
        token: result.token,
        merchant: result.merchant,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', 400, error.errors));
      }
      next(error);
    }
  },

  async loginAdmin(req: Request, res: Response, next: import('express').NextFunction): Promise<void> {
    try {
      const { email, username, password } = loginSchema.parse(req.body);
      const identifier = (email || username)!;
      const result = await AuthService.authenticateAdmin(identifier, password);

      res.json({
        token: result.token,
        admin: result.admin,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', 400, error.errors));
      }
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: import('express').NextFunction): Promise<void> {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      await AuthService.forgotPassword(email);

      // Always return success to prevent email enumeration
      res.json({ message: 'If an account exists, a reset email has been sent.' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid email', 400, error.errors));
      }
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: import('express').NextFunction): Promise<void> {
    try {
      const schema = z.object({
        token: z.string(),
        password: z.string().min(6)
      });
      const { token, password } = schema.parse(req.body);

      await AuthService.resetPassword(token, password);
      res.json({ message: 'Password has been reset successfully.' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', 400, error.errors));
      }
      next(error);
    }
  },
};
