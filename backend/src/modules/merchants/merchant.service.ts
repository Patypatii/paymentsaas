import { MerchantModel, IMerchant } from './merchant.model';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { hashPassword } from '../../common/utils/crypto';
import { EmailService } from '../../common/services/email.service';

export class MerchantService {
  static async register(data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    password: string;
    referralSource?: string;
  }): Promise<{
    merchant: IMerchant;
    message: string;
  }> {
    console.log('🔍 MerchantService.register called with:', {
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName
    });

    // Check if email already exists
    console.log('🔍 Checking if email exists:', data.email);
    const existingEmail = await MerchantModel.findOne({ email: data.email });
    if (existingEmail) {
      console.log('❌ Email already exists:', data.email);
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email already registered', 400);
    }
    console.log('✅ Email is available');

    // Check if username exists
    console.log('🔍 Checking if username exists:', data.username);
    const existingUsername = await MerchantModel.findOne({ username: data.username });
    if (existingUsername) {
      console.log('❌ Username already exists:', data.username);
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Username already taken', 400);
    }
    console.log('✅ Username is available');

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(data.password);
    console.log('✅ Password hashed');

    // Create merchant
    console.log('💾 Creating merchant document...');
    const merchant = await MerchantModel.create({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      passwordHash,
      referralSource: data.referralSource,
      status: 'PENDING' // Default status
    });
    console.log('✅ Merchant created:', merchant.id);

    // Send Welcome Email (Async)
    EmailService.sendWelcomeEmail(merchant.email, `${merchant.firstName} ${merchant.lastName}`).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return {
      merchant,
      message: 'Registration successful. Please wait for account approval.',
    };
  }

  static async updateMerchant(merchantId: string, update: any): Promise<any> {
    // If status is being updated to ACTIVE, set verifiedAt
    if (update.status === 'ACTIVE' && !update.verifiedAt) {
      update.verifiedAt = new Date();
    }

    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { $set: update },
      { new: true }
    );
    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }
    return merchant;
  }

  static async getProfile(merchantId: string): Promise<IMerchant> {
    const merchant = await MerchantModel.findById(merchantId);
    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }
    return merchant;
  }

  static async updateProfile(
    merchantId: string,
    updates: { businessName?: string; notifications?: any }
  ): Promise<IMerchant> {
    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { $set: updates },
      { new: true }
    );

    if (!merchant) {
      throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Merchant not found', 404);
    }

    return merchant;
  }

  /**
   * Update merchant profile picture
   */
  static async updateProfilePicture(merchantId: string, imageUrl: string) {
    // Validate ImageKit URL
    if (!imageUrl.startsWith('https://ik.imagekit.io/')) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid image URL', 400);
    }

    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { $set: { profilePicture: imageUrl } },
      { new: true }
    );

    if (!merchant) {
      throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Merchant not found', 404);
    }

    return merchant;
  }

  /**
   * Update merchant bio
   */
  static async updateBio(merchantId: string, bio: string) {
    // Validate bio length
    if (bio && bio.length > 500) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Bio must be 500 characters or less', 400);
    }

    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { $set: { bio } },
      { new: true }
    );

    if (!merchant) {
      throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Merchant not found', 404);
    }

    return merchant;
  }

  static async activateMerchant(merchantId: string): Promise<{
    merchant: IMerchant;
    apiKey: string;
  }> {
    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { status: 'ACTIVE', verifiedAt: new Date() },
      { new: true }
    );

    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }

    // Generate initial API key
    const { ApiKeyService } = await import('../api-keys/apiKey.service');
    const { apiKey } = await ApiKeyService.generateKey(merchantId, 'Initial Key');

    return {
      merchant,
      apiKey,
    };
  }
}
