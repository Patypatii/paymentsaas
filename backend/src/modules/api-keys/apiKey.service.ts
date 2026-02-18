import { ApiKeyModel } from './apiKey.model';
import { generateApiKey, hashApiKey, verifyApiKey } from '../../common/utils/crypto';
import { securityConfig } from '../../config/security';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { logger } from '../../common/utils/logger';

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
    // Extract prefix from the provided key (e.g. "pk_" from "pk_abc123...")
    // Fixed: Current regex [a-z_]+ was too greedy and matched part of the key.
    // We want to match the prefix until the first underscore.
    const prefixMatch = apiKey.match(/^([a-z]+_)/);
    const keyPrefix = prefixMatch ? prefixMatch[1] : null;

    // Filter active keys by prefix to avoid bcrypt-comparing every key in the system
    const query: any = { isActive: true, revokedAt: null };
    if (keyPrefix) {
      query.keyPrefix = keyPrefix;
    }

    const activeKeys = await ApiKeyModel.find(query).populate('merchantId');

    logger.debug(`API key validation: checking ${activeKeys.length} candidate key(s) with prefix "${keyPrefix}"`);

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
   * Permanently delete an API key
   */
  static async hardDeleteKey(merchantId: string, keyId: string): Promise<void> {
    const result = await ApiKeyModel.deleteOne({ _id: keyId, merchantId });

    if (result.deletedCount === 0) {
      throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'API key not found', 404);
    }
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
