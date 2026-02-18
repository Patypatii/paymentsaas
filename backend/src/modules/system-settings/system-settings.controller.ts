import { Request, Response } from 'express';
import { SystemSettingsService, PLATFORM_CHANNEL_KEY } from './system-settings.service';
import { asyncHandler } from '../../common/utils/asyncHandler';

export const systemSettingsController = {
    getPlatformChannel: asyncHandler(async (_req: Request, res: Response) => {
        const channel = await SystemSettingsService.getPlatformChannel();
        res.json({ success: true, channel });
    }),

    updatePlatformChannel: asyncHandler(async (req: Request, res: Response) => {
        const { type, number, accountNumber } = req.body;
        const userId = req.user?.userId;

        const channelConfig = {
            type, // 'PAYBILL' | 'TILL'
            number,
            accountNumber
        };

        await SystemSettingsService.setSetting(PLATFORM_CHANNEL_KEY, channelConfig, userId);
        res.json({ success: true, message: 'Platform channel updated', channel: channelConfig });
    })
};
