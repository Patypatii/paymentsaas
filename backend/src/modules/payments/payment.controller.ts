import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { z } from 'zod';
import { phoneNumberSchema } from '../merchants/merchant.validation';
import { asyncHandler } from '../../common/utils/asyncHandler';

const stkPushSchema = z.object({
  phone: phoneNumberSchema,
  amount: z.number().positive().min(1),
  reference: z.string().min(1).max(255),
  description: z.string().max(255).optional(), // Fixed: made optional to match service logic
  channelId: z.string().optional(),
  callbackUrl: z.string().url().optional(),
});

const getMerchantId = (req: Request): string => {
  if (req.merchantId) return req.merchantId;
  if (req.user?.type === 'merchant') return req.user.userId;
  throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
};

export const paymentController = {
  initiateSTKPush: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const merchantId = getMerchantId(req);
    const request = stkPushSchema.parse(req.body);
    const result = await PaymentService.initiateSTKPush(merchantId, request);
    res.status(201).json(result);
  }),

  getTransaction: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const merchantId = getMerchantId(req);
    const { transactionId } = req.params;
    const transaction = await PaymentService.getTransaction(merchantId, transactionId);
    res.json({ transaction });
  }),

  listTransactions: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const merchantId = getMerchantId(req);
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const result = await PaymentService.listTransactions(merchantId, limit, offset);
    res.json(result);
  }),

  getDashboardStats: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const merchantId = getMerchantId(req);
    const stats = await PaymentService.getDashboardStats(merchantId);
    res.json(stats);
  }),
};
