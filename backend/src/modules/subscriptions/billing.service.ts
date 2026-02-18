import { MerchantModel } from '../merchants/merchant.model';
import { SubscriptionModel, ISubscription } from './plans.model';
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
  ): Promise<ISubscription> {
    const plan = getPlan(planId);
    if (!plan) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid plan', 400);
    }

    // Cancel existing subscription
    const existing = await SubscriptionModel.findOne({ merchantId, status: 'ACTIVE' });
    if (existing) {
      existing.status = 'CANCELLED';
      await existing.save();
    }

    // Create new subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await SubscriptionModel.create({
      merchantId,
      planId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      status: 'ACTIVE'
    });

    // Update merchant plan
    await MerchantModel.findByIdAndUpdate(merchantId, { planId });

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
    subscription: ISubscription | null;
    plan: any;
  }> {
    const subscription = await SubscriptionModel.findOne({ merchantId, status: 'ACTIVE' });

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
    const subscription = await SubscriptionModel.findById(subscriptionId);

    if (!subscription) {
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = periodEnd;
    await subscription.save();

    logger.info('Subscription renewed', {
      subscriptionId,
      merchantId: subscription.merchantId,
    });
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(merchantId: string): Promise<void> {
    const subscription = await SubscriptionModel.findOne({ merchantId, status: 'ACTIVE' });
    if (subscription) {
      subscription.status = 'CANCELLED';
      await subscription.save();
      logger.info('Subscription cancelled', { merchantId, subscriptionId: subscription.id });
    }
  }
}
