import { Request, Response } from 'express';
import { ApiKeyService } from './apiKey.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler';

const createKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(100),
});

export const apiKeyController = {
  createKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const { name } = createKeySchema.parse(req.body);
    const result = await ApiKeyService.generateKey(req.user.userId, name);

    res.status(201).json({
      apiKey: result.apiKey,
      id: result.id,
      name: name || 'Default',
      warning: 'Store this API key securely. It will not be shown again.',
    });
  }),

  listKeys: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const keys = await ApiKeyService.listKeys(req.user.userId);
    res.json({ keys });
  }),

  revokeKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.type !== 'merchant') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
    }

    const { keyId } = req.params;
    await ApiKeyService.revokeKey(req.user.userId, keyId);

    res.json({ message: 'API key revoked successfully' });
  }),
};
