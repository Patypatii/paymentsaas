import { pool } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { MerchantModel } from '../merchants/merchant.model';

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
      // Check 1: Unusually large amount
      const avgResult = await pool.query(
        `SELECT AVG(amount) as avg_amount, MAX(amount) as max_amount
         FROM transactions
         WHERE merchant_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
        [merchantId]
      );

      if (avgResult.rows[0].avg_amount) {
        const avgAmount = parseFloat(avgResult.rows[0].avg_amount);
        if (amount > avgAmount * 5) {
          score += 30;
          reasons.push('Amount significantly higher than average');
        }
      }

      // Check 2: Rapid transactions from same phone
      const rapidResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM transactions
         WHERE merchant_id = $1 AND phone = $2 AND created_at > NOW() - INTERVAL '5 minutes'`,
        [merchantId, phone]
      );

      const rapidCount = parseInt(rapidResult.rows[0].count, 10);
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
