import { pool } from '../../config/database';
import { SubscriptionModel, Subscription } from './plans.model';
import { PlanType, PLANS, getPlan } from '../../common/constants/plans';
import { logger } from '../../common/utils/logger';
import { AppError, ErrorCode } from '../../common/constants/errors';

export class BillingService {
  /**
   * Create or update subscription for merchant
   */
  static async createSubscription(
    merchantId: string,
    planId: PlanType
  ): Promise<Subscription> {
    const plan = getPlan(planId);
    if (!plan) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid plan', 400);
    }

    // Cancel existing subscription
    const existing = await SubscriptionModel.findByMerchant(merchantId);
    if (existing) {
      await SubscriptionModel.updateStatus(existing.id, 'CANCELLED');
    }

    // Create new subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await SubscriptionModel.create({
      merchantId,
      planId,
      periodStart: now,
      periodEnd,
    });

    // Update merchant plan
    await pool.query(
      `UPDATE merchants SET plan_id = $1 WHERE id = $2`,
      [planId, merchantId]
    );

    logger.info('Subscription created', {
      merchantId,
      planId,
      subscriptionId: subscription.id,
    });

    return subscription;
  }

  /**
   * Get merchant subscription
   */
  static async getSubscription(merchantId: string): Promise<{
    subscription: Subscription | null;
    plan: any;
  }> {
    const subscription = await SubscriptionModel.findByMerchant(merchantId);
    
    if (!subscription) {
      // Return default starter plan
      return {
        subscription: null,
        plan: PLANS[PlanType.STARTER],
      };
    }

    const plan = getPlan(subscription.planId);
    return {
      subscription,
      plan: plan || PLANS[PlanType.STARTER],
    };
  }

  /**
   * Renew subscription (called monthly)
   */
  static async renewSubscription(subscriptionId: string): Promise<void> {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [subscriptionId]
    );

    if (result.rows.length === 0) {
      return;
    }

    const subscription = result.rows[0];
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await SubscriptionModel.updatePeriod(subscription.id, now, periodEnd);
    
    logger.info('Subscription renewed', {
      subscriptionId,
      merchantId: subscription.merchant_id,
    });
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(merchantId: string): Promise<void> {
    const subscription = await SubscriptionModel.findByMerchant(merchantId);
    if (subscription) {
      await SubscriptionModel.updateStatus(subscription.id, 'CANCELLED');
      logger.info('Subscription cancelled', { merchantId, subscriptionId: subscription.id });
    }
  }
}
