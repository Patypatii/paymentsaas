import { ApiKeyModel } from './apiKey.model';
import { generateApiKey, hashApiKey, verifyApiKey } from '../../common/utils/crypto';
import { securityConfig } from '../../config/security';
import { AppError, ErrorCode } from '../../common/constants/errors';

export class ApiKeyService {
  /**
   * Generate a new API key for a merchant
   */
  static async generateKey(merchantId: string, name?: string): Promise<{
    apiKey: string;
    id: string;
  }> {
    const apiKey = generateApiKey(securityConfig.apiKey.prefix);
    const keyHash = await hashApiKey(apiKey);

    const newKey = await ApiKeyModel.create({
      merchantId,
      keyHash,
      keyPrefix: securityConfig.apiKey.prefix,
      name: name || 'Default',
    });

    return {
      apiKey,
      id: newKey.id,
    };
  }

  /**
   * Validate API key and return merchant info
   */
  static async validateKey(apiKey: string): Promise<{
    merchantId: string;
    merchant: any;
  }> {
    // 1. We need to find the key by prefix first to optimize, but we don't store prefix indexed for search maybe?
    // Actually we can't search by keyHash directly because verifyApiKey is likely bcrypt compare.
    // So we need to fetch ALL active keys for the given prefix? Or just all active keys?
    // The previous SQL queried ALL active keys for active merchants. That's expensive.
    // Optimization: API Key usually has a prefix. We can check if apiKey starts with a prefix, 
    // but here we just iterate all active keys for the merchant? No, the SQL joined matches.
    // The previous code fetched ALL active keys in the system? No "WHERE ak.is_active = true".
    // That seems very inefficient if there are many keys. 
    // Assumption: The provided apiKey contains the prefix? 
    // Let's assume we have to iterate.
    // IMPROVEMENT: Retrieve keys by prefix if possible, or just iterate active keys.
    // For now, let's replicate the logic but we can do better: `verifyApiKey` is expensive.
    // Usually API keys are stored as `prefix.hash`.
    // If we can extract the prefix?

    // Filter active keys.
    // Since we don't know the merchant, we have to find the key.
    // This is problematic with bcrypt. Mongoose/Mongo Find logic:
    // We can't find by hash.
    // Strategy: We will query keys that match the prefix?
    // `securityConfig.apiKey.prefix` is a global prefix?
    // If so, it doesn't help distinguish.

    // Fallback: Fetch all active keys.
    const activeKeys = await ApiKeyModel.find({
      isActive: true,
      revokedAt: null
    }).populate('merchantId');

    for (const keyDoc of activeKeys) {
      // Check if merchant is active
      const merchant = keyDoc.merchantId as any;
      if (!merchant || merchant.status !== 'ACTIVE') continue;

      const isValid = await verifyApiKey(apiKey, keyDoc.keyHash);
      if (isValid) {
        // Update last used
        keyDoc.lastUsedAt = new Date();
        await keyDoc.save();

        return {
          merchantId: merchant.id,
          merchant: {
            id: merchant.id,
            businessName: merchant.businessName,
            status: merchant.status,
            planId: merchant.planId
          }
        };
      }
    }

    throw new AppError(ErrorCode.INVALID_API_KEY, 'Invalid API key', 401);
  }

  /**
   * Revoke an API key
   */
  static async revokeKey(merchantId: string, keyId: string): Promise<void> {
    const key = await ApiKeyModel.findOne({ _id: keyId, merchantId });

    if (!key) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'API key not found', 404);
    }

    key.isActive = false;
    key.revokedAt = new Date();
    await key.save();
  }

  /**
   * List API keys for a merchant
   */
  static async listKeys(merchantId: string): Promise<any[]> {
    const keys = await ApiKeyModel.find({ merchantId }).sort({ createdAt: -1 });

    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.keyPrefix,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      isActive: key.isActive && !key.revokedAt,
    }));
  }
}
