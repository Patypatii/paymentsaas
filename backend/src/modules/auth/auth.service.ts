import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { verifyPassword } from '../../common/utils/crypto';
import { MerchantModel } from '../merchants/merchant.model';
import { AdminModel } from '../admin/admin.model';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { JWTPayload } from './auth.types';

export class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (error) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token', 401);
    }
  }

  /**
  /**
   * Authenticate merchant with email and password
   */
  static async authenticateMerchant(email: string, password: string): Promise<{
    token: string;
    merchant: any;
  }> {
    const merchant = await MerchantModel.findOne({
      $or: [{ email: email }, { username: email }]
    });

    if (!merchant) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials', 401);
    }

    const isValid = await verifyPassword(password, merchant.passwordHash);
    if (!isValid) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials', 401);
    }

    if (merchant.status === 'SUSPENDED' || merchant.status === 'REJECTED') {
      throw new AppError(ErrorCode.UNAUTHORIZED, `Account is ${merchant.status.toLowerCase()}`, 403);
    }

    const token = this.generateToken({
      userId: merchant.id,
      email: merchant.email,
      type: 'merchant',
    });

    return {
      token,
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        status: merchant.status,
      },
    };
  }

  /**
   * Authenticate admin with email and password
   */
  static async authenticateAdmin(email: string, password: string): Promise<{
    token: string;
    admin: any;
  }> {
    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials', 401);
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials', 401);
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = this.generateToken({
      userId: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
