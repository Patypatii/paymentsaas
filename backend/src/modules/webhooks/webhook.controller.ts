import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class WebhookController {

    static listWebhooks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const merchantId = req.user!.userId;
        const webhooks = await WebhookService.listWebhooks(merchantId);

        res.json({
            success: true,
            webhooks: webhooks.map(w => ({
                id: w.id,
                url: w.url,
                events: w.events,
                isActive: w.isActive,
                secret: w.secret, // Return secret so they can verify signature
                createdAt: w.createdAt
            }))
        });
    });

    static createWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const merchantId = req.user!.userId;
        const { url, events } = req.body;

        if (!url || !events || !Array.isArray(events)) {
            res.status(400).json({
                success: false,
                message: 'URL and events array are required'
            });
            return;
        }

        const webhook = await WebhookService.createWebhook(merchantId, { url, events });

        res.status(201).json({
            success: true,
            webhook: {
                id: webhook.id,
                url: webhook.url,
                events: webhook.events,
                secret: webhook.secret,
                isActive: webhook.isActive,
                createdAt: webhook.createdAt
            }
        });
    });

    static deleteWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const merchantId = req.user!.userId;
        const { webhookId } = req.params;

        await WebhookService.deleteWebhook(merchantId, webhookId);

        res.json({
            success: true,
            message: 'Webhook deleted successfully'
        });
    });
}

export const webhookController = WebhookController;
