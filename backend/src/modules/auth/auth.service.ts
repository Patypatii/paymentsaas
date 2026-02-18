import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { verifyPassword, hashPassword } from '../../common/utils/crypto';
import { MerchantModel } from '../merchants/merchant.model';
import { AdminModel } from '../admin/admin.model';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { JWTPayload } from './auth.types';
import { EmailService } from '../../common/services/email.service';

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

  /**
   * Request Password Reset
   */
  static async forgotPassword(email: string): Promise<void> {
    const merchant = await MerchantModel.findOne({ email });
    if (!merchant) {
      // Don't reveal user existence
      return;
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    merchant.resetPasswordToken = resetTokenHash;
    merchant.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await merchant.save();

    await EmailService.sendPasswordResetEmail(merchant.email, resetToken);
  }

  /**
   * Reset Password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const merchant = await MerchantModel.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!merchant) {
      throw new AppError(ErrorCode.INVALID_TOKEN, 'Invalid or expired token', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    merchant.passwordHash = passwordHash;
    merchant.resetPasswordToken = undefined;
    merchant.resetPasswordExpires = undefined;
    await merchant.save();

    // Optional: Send confirmation email
    await EmailService.send({
      to: [{ email: merchant.email }],
      subject: 'Password Changed Successfully',
      htmlContent: '<p>Your Paylor account password has been successfully changed.</p>'
    });
  }
}
