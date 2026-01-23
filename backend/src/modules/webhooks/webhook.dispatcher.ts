import axios from 'axios';
import { WebhookModel, WebhookDeliveryModel } from './webhook.model';
import { logger } from '../../common/utils/logger';
import { config } from '../../config/env';
import crypto from 'crypto';

export class WebhookDispatcher {
  /**
   * Generate webhook signature
   */
  private static generateSignature(payload: string, secret?: string): string {
    if (!secret) {
      return '';
    }
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Dispatch webhook to merchant endpoint
   */
  static async dispatch(
    webhookId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    const webhook = await WebhookModel.findById(webhookId);
    if (!webhook || !webhook.isActive) {
      return;
    }

    // Check if webhook subscribes to this event
    if (!webhook.events.includes(eventType) && !webhook.events.includes('*')) {
      return;
    }

    const webhookPayload = JSON.stringify(payload);
    const signature = this.generateSignature(webhookPayload, webhook.secret);

    try {
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType,
        },
        timeout: 10000,
      });

      // Record successful delivery
      await WebhookDeliveryModel.create({
        webhookId,
        eventType,
        payload: payload, // Mongoose handles Mixed type, nice
        status: 'SUCCESS',
        responseStatus: response.status,
        attemptNumber: 1,
        deliveredAt: new Date()
      });

      logger.info('Webhook delivered successfully', {
        webhookId,
        eventType,
        status: response.status,
      });
    } catch (error: any) {
      // Record failed delivery
      const nextRetryAt = new Date(Date.now() + config.webhook.retryDelayMs);

      await WebhookDeliveryModel.create({
        webhookId,
        eventType,
        payload: payload,
        status: 'FAILED',
        responseStatus: error.response?.status || 0,
        attemptNumber: 1,
        nextRetryAt
      });

      logger.error('Webhook delivery failed', {
        webhookId,
        eventType,
        error: error.message,
      });

      // Schedule retry (would be handled by a background job)
      // For now, we just log it
    }
  }

  /**
   * Dispatch transaction update event
   */
  static async dispatchTransactionUpdate(
    merchantId: string,
    transactionData: any
  ): Promise<void> {
    const webhooks = await WebhookModel.find({ merchantId, isActive: true });

    for (const webhook of webhooks) {
      await this.dispatch(webhook.id, 'transaction.updated', transactionData);
    }
  }
}
