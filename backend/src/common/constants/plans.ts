export enum PlanType {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  SCALE = 'SCALE',
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number; // in KES
  monthlyTransactionLimit: number;
  rateLimitPerMinute: number;
  features: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  [PlanType.STARTER]: {
    id: PlanType.STARTER,
    name: 'Starter',
    price: 1000,
    monthlyTransactionLimit: 1000,
    rateLimitPerMinute: 10,
    features: [
      'STK Push payments',
      'Basic webhook support',
      'Transaction logs',
      'Email support',
    ],
  },
  [PlanType.GROWTH]: {
    id: PlanType.GROWTH,
    name: 'Growth',
    price: 5000,
    monthlyTransactionLimit: 10000,
    rateLimitPerMinute: 50,
    features: [
      'STK Push payments',
      'Advanced webhook support',
      'Transaction logs & analytics',
      'Priority support',
      'Custom webhook URLs',
    ],
  },
  [PlanType.SCALE]: {
    id: PlanType.SCALE,
    name: 'Scale',
    price: 0, // Custom pricing
    monthlyTransactionLimit: -1, // Unlimited
    rateLimitPerMinute: 200,
    features: [
      'STK Push payments',
      'Advanced webhook support',
      'Transaction logs & analytics',
      'Dedicated support',
      'Custom webhook URLs',
      'SLA guarantee',
      'Custom integrations',
    ],
  },
};

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId as PlanType];
}

export function isValidPlan(planId: string): boolean {
  return planId in PLANS;
}
