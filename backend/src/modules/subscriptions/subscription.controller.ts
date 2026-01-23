import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { UsageTracker } from './usage.tracker';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { PlanType } from '../../common/constants/plans';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler';

const createSubscriptionSchema = z.object({
  planId: z.nativeEnum(PlanType),
});

export const subscriptionController = {
  getSubscription: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const result = await BillingService.getSubscription(req.user.userId);
    const usage = await UsageTracker.getCurrentUsage(req.user.userId);

    res.json({
      subscription: result.subscription,
      plan: result.plan,
      usage: {
        transactionCount: usage?.transactionCount || 0,
        totalAmount: usage?.totalAmount || 0,
        periodStart: usage?.periodStart,
        periodEnd: usage?.periodEnd,
      },
    });
  }),

  createSubscription: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const { planId } = createSubscriptionSchema.parse(req.body);
    const subscription = await BillingService.createSubscription(req.user.userId, planId);

    res.status(201).json({ subscription });
  }),

  cancelSubscription: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    await BillingService.cancelSubscription(req.user.userId);
    res.json({ message: 'Subscription cancelled successfully' });
  }),
};
