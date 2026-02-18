import { Request, Response } from 'express';
import { PLANS } from '../../common/constants/plans';

export const pricingController = {
  async getPricing(_req: Request, res: Response): Promise<void> {
    try {
      const plans = Object.values(PLANS).map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        monthlyTransactionLimit: plan.monthlyTransactionLimit,
        rateLimitPerMinute: plan.rateLimitPerMinute,
        features: plan.features,
      }));

      res.json({
        plans,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch pricing information',
      });
    }
  },
};
