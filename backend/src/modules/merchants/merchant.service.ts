import { MerchantModel, IMerchant } from './merchant.model';
import { ApiKeyService } from '../api-keys/apiKey.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { hashPassword } from '../../common/utils/crypto';

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
    });
    console.log('✅ Merchant created:', merchant.id);

    return {
      merchant,
      message: 'Registration successful.',
    };
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
    updates: Partial<IMerchant>
  ): Promise<IMerchant> {
    const merchant = await MerchantModel.findByIdAndUpdate(merchantId, updates, { new: true });
    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }
    return merchant;
  }

  static async activateMerchant(merchantId: string): Promise<{
    merchant: IMerchant;
    apiKey: string;
  }> {
    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { status: 'ACTIVE' },
      { new: true }
    );

    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }

    // Generate initial API key
    const { apiKey } = await ApiKeyService.generateKey(merchantId, 'Initial Key');

    return {
      merchant,
      apiKey,
    };
  }
}
