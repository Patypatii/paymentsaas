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

  updateProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    // Allow updating: businessName, phoneNumber, notifications, settlementType, etc.
    // We should strictly define what can be updated to avoid overwriting sensitive fields like balance or status.
    const updates = req.body;

    // Whitelist allowed fields
    const allowedUpdates: any = {};
    if (updates.businessName !== undefined) allowedUpdates.businessName = updates.businessName;
    if (updates.phoneNumber !== undefined) allowedUpdates.phoneNumber = updates.phoneNumber;
    if (updates.notifications !== undefined) allowedUpdates.notifications = updates.notifications;
    // Add other safe fields as needed

    const merchant = await MerchantService.updateProfile(req.user.userId, allowedUpdates);
    res.json({ merchant, message: 'Profile updated successfully' });
  }),

  updateProfilePicture: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'imageUrl is required', 400);
    }

    const merchant = await MerchantService.updateProfilePicture(req.user.userId, imageUrl);
    res.json({ merchant, message: 'Profile picture updated successfully' });
  }),

  updateBio: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const { bio } = req.body;
    const merchant = await MerchantService.updateBio(req.user.userId, bio || '');
    res.json({ merchant, message: 'Bio updated successfully' });
  }),
};
