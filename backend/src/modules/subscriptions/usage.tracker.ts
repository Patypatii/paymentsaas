import { UsageTrackingModel } from './usage.model';
import { logger } from '../../common/utils/logger';
import mongoose from 'mongoose';

export interface UsageStats {
  transactionCount: number;
  totalAmount: number;
  periodStart: Date;
  periodEnd: Date;
}

export class UsageTracker {
  /**
   * Track transaction usage
   */
  static async trackTransaction(
    merchantId: string,
    amount: number,
    subscriptionId?: string
  ): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
      await UsageTrackingModel.findOneAndUpdate(
        {
          merchantId: new mongoose.Types.ObjectId(merchantId),
          periodStart
        },
        {
          $setOnInsert: { periodEnd, subscriptionId: subscriptionId ? new mongoose.Types.ObjectId(subscriptionId) : undefined },
          $inc: {
            transactionCount: 1,
            totalAmount: amount
          }
        },
        { upsert: true, new: true }
      );
    } catch (error: any) {
      logger.error('Failed to track usage', {
        error: error.message,
        merchantId,
        amount,
      });
      // Don't throw - usage tracking shouldn't break the payment flow
    }
  }

  /**
   * Get current period usage
   */
  static async getCurrentUsage(merchantId: string): Promise<UsageStats | null> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const usage = await UsageTrackingModel.findOne({
      merchantId: new mongoose.Types.ObjectId(merchantId),
      periodStart
    });

    if (!usage) {
      return {
        transactionCount: 0,
        totalAmount: 0,
        periodStart,
        periodEnd,
      };
    }

    return {
      transactionCount: usage.transactionCount,
      totalAmount: usage.totalAmount,
      periodStart: usage.periodStart,
      periodEnd: usage.periodEnd,
    };
  }

  /**
   * Check if merchant has exceeded quota
   */
  static async checkQuota(merchantId: string, planLimit: number): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }> {
    if (planLimit === -1) {
      // Unlimited plan
      return { allowed: true, current: 0, limit: -1 };
    }

    const usage = await this.getCurrentUsage(merchantId);
    const current = usage?.transactionCount || 0;

    return {
      allowed: current < planLimit,
      current,
      limit: planLimit,
    };
  }
}
