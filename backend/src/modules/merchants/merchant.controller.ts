import { Request, Response } from 'express';
import { MerchantService } from './merchant.service';
import { merchantRegistrationSchema } from './merchant.validation';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { asyncHandler } from '../../common/utils/asyncHandler';

export const merchantController = {
  register: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = merchantRegistrationSchema.parse(req.body);
    const result = await MerchantService.register(data);
    res.status(201).json(result);
  }),

  getProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const merchant = await MerchantService.getProfile(req.user.userId);
    res.json({ merchant });
  }),
};
