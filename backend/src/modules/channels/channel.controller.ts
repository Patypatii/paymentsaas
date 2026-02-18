import { Request, Response } from 'express';
import { ChannelService } from './channel.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { z } from 'zod';
import { ChannelType, ChannelModel } from './channel.model';
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
        const user = req.user;
        if (!user || user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const channels = await ChannelService.listChannels(user.userId);
        res.json({ channels });
    }),

    createChannel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = req.user;
        if (!user || user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const data = createChannelSchema.parse(req.body);
        const channel = await ChannelService.createChannel(user.userId, data);

        res.status(201).json({
            message: 'Channel created successfully',
            channel,
        });
    }),

    updateChannel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = req.user;
        if (!user || user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const { channelId } = req.params;
        const data = updateChannelSchema.parse(req.body);
        const channel = await ChannelService.updateChannel(user.userId, channelId, data);

        res.json({
            message: 'Channel updated successfully',
            channel,
        });
    }),

    deleteChannel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = req.user;
        if (!user || user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const { channelId } = req.params;
        await ChannelService.deleteChannel(user.userId, channelId);

        res.json({
            message: 'Channel deleted successfully',
        });
    }),

    syncAliases: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const channels = await ChannelModel.find({ alias: { $exists: false } });
        let count = 0;

        const generateAlias = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = 'PAYL-';
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        for (const channel of channels) {
            let alias = generateAlias();
            let isUnique = false;
            while (!isUnique) {
                const exists = await ChannelModel.findOne({ alias });
                if (!exists) {
                    isUnique = true;
                } else {
                    alias = generateAlias();
                }
            }

            channel.alias = alias;
            await channel.save();
            count++;
        }

        res.json({
            message: `Successfully synchronized ${count} aliases`,
            synced: count,
        });
    }),
};
/* cspell:ignore ABCDEFGHJKLMNPQRSTUVWXYZ PAYL */
