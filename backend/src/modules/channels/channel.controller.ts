import { Request, Response, NextFunction } from 'express';
import { ChannelService } from './channel.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { z } from 'zod';
import { ChannelType } from './channel.model';
import { asyncHandler } from '../../common/utils/asyncHandler';

const createChannelSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.nativeEnum(ChannelType),
    number: z.string().min(1).max(20),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
});

const updateChannelSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const channelController = {
    listChannels: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const channels = await ChannelService.listChannels(req.user.userId);
        res.json({ channels });
    }),

    createChannel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const data = createChannelSchema.parse(req.body);
        const channel = await ChannelService.createChannel(req.user.userId, data);

        res.status(201).json({
            message: 'Channel created successfully',
            channel,
        });
    }),

    updateChannel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const { channelId } = req.params;
        const data = updateChannelSchema.parse(req.body);
        const channel = await ChannelService.updateChannel(req.user.userId, channelId, data);

        res.json({
            message: 'Channel updated successfully',
            channel,
        });
    }),

    deleteChannel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const { channelId } = req.params;
        await ChannelService.deleteChannel(req.user.userId, channelId);

        res.json({
            message: 'Channel deleted successfully',
        });
    }),
};
