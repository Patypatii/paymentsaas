import { logger } from '../../common/utils/logger';
import { MerchantModel } from '../merchants/merchant.model';
import { PaymentModel } from '../payments/payment.model';
import mongoose from 'mongoose';

export interface FraudCheckResult {
  isFraud: boolean;
  reason?: string;
  score: number; // 0-100, higher = more suspicious
}

export class FraudRules {
  /**
   * Check if transaction is suspicious
   */
  static async checkTransaction(
    merchantId: string,
    amount: number,
    phone: string
  ): Promise<FraudCheckResult> {
    let score = 0;
    const reasons: string[] = [];

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Check 1: Unusually large amount
      const stats = await PaymentModel.aggregate([
        {
          $match: {
            merchantId: new mongoose.Types.ObjectId(merchantId),
            createdAt: { $gt: thirtyDaysAgo },
            status: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: null,
            avgAmount: { $avg: '$amount' },
            maxAmount: { $max: '$amount' }
          }
        }
      ]);

      if (stats.length > 0 && stats[0].avgAmount) {
        const avgAmount = stats[0].avgAmount;
        if (amount > avgAmount * 5) {
          score += 30;
          reasons.push('Amount significantly higher than average');
        }
      }

      // Check 2: Rapid transactions from same phone
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const rapidCount = await PaymentModel.countDocuments({
        merchantId,
        customerPhone: phone,
        createdAt: { $gt: fiveMinutesAgo }
      });

      if (rapidCount > 5) {
        score += 40;
        reasons.push('Too many rapid transactions from same phone');
      }

      // Check 3: Merchant status
      const merchant = await MerchantModel.findById(merchantId);
      if (merchant && merchant.status !== 'ACTIVE') {
        score += 50;
        reasons.push('Merchant account not active');
      }

      const isFraud = score >= 50;
      return {
        isFraud,
        reason: reasons.length > 0 ? reasons.join('; ') : undefined,
        score,
      };
    } catch (error: any) {
      logger.error('Fraud check failed', {
        error: error.message,
        merchantId,
      });
      // Fail open - allow transaction if check fails
      return { isFraud: false, score: 0 };
    }
  }
}
