import { WebhookModel, IWebhook } from './webhook.model';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { generateApiKey } from '../../common/utils/crypto';

export class WebhookService {
    /**
     * Create a new webhook
     */
    static async createWebhook(
        merchantId: string,
        data: { url: string; events: string[] }
    ): Promise<IWebhook> {
        const existing = await WebhookModel.findOne({ merchantId, url: data.url });
        if (existing) {
            throw new AppError(ErrorCode.VALIDATION_ERROR, 'Webhook URL already registered', 400);
        }

        // Generate a secret for signature verification
        const secret = generateApiKey('whsec');

        const webhook = await WebhookModel.create({
            merchantId,
            url: data.url,
            events: data.events,
            secret,
            isActive: true,
        });

        return webhook;
    }

    /**
     * List webhooks for a merchant
     */
    static async listWebhooks(merchantId: string): Promise<IWebhook[]> {
        return WebhookModel.find({ merchantId }).sort({ createdAt: -1 });
    }

    /**
     * Delete a webhook
     */
    static async deleteWebhook(merchantId: string, webhookId: string): Promise<void> {
        const webhook = await WebhookModel.findOneAndDelete({ _id: webhookId, merchantId });
        if (!webhook) {
            throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Webhook not found', 404);
        }
    }

    /**
     * Get webhook details (including secret)
     */
    static async getWebhook(merchantId: string, webhookId: string): Promise<IWebhook> {
        const webhook = await WebhookModel.findOne({ _id: webhookId, merchantId });
        if (!webhook) {
            throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Webhook not found', 404);
        }
        return webhook;
    }
}
