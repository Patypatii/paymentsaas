import { config } from '../../config/env';
import { logger } from '../utils/logger';

export class WhatsappService {
  /**
   * Send a WhatsApp message using the Apiskan API
   * @param to Phone number with country code, no + or -
   * @param body Message content
   */
  static async sendMessage(to: string, body: string): Promise<boolean> {
    try {
      const url = `${config.apiskan.baseUrl}/messages`;
      
      // Clean up phone number: remove any +, spaces, or dashes
      let cleanPhone = to.replace(/[\+\-\s]/g, '');
      // Normalise to international format: 07xx → 2547xx, 7xx → 2547xx
      if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
      else if (/^[71]/.test(cleanPhone) && cleanPhone.length <= 9) cleanPhone = '254' + cleanPhone;

      // instanceId is the UUID of the WhatsApp instance (NOT the API key)
      // The API key authenticates via the x-api-key header
      const payload = {
        instanceId: config.apiskan.instanceId,
        to: cleanPhone,
        body,
        type: 'text'
      };

      console.log(`WhatsApp API Sending Content: To=${cleanPhone}, Instance=${payload.instanceId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiskan.instanceKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Apiskan WhatsApp Error [${response.status}]:`, errorText);
        logger.error(`Apiskan WhatsApp Error: ${response.status} ${response.statusText}`, { error: errorText });
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp API success:', JSON.stringify(result));
      logger.info(`WhatsApp message sent successfully to ${cleanPhone}`);
      return true;
    } catch (error: any) {
      logger.error('Failed to send WhatsApp message', { error: error.message });
      return false;
    }
  }

  /**
   * Send payment notification to merchant and customer
   */
  static async sendPaymentSuccessNotification(
    customerPhone: string,
    merchantPhone: string | undefined,
    merchantName: string,
    amount: number,
    currency: string,
    reference: string,
    mpesaReceipt: string | null
  ) {
    const receiptSnippet = mpesaReceipt ? `Receipt: ${mpesaReceipt}\n` : '';
    
    // Customer Message
    const customerMsg = `Payment successful!\n\nYou paid ${currency} ${amount} to *${merchantName}*.\nRef: ${reference}\n${receiptSnippet}\nThank you for choosing us!`;
    const customerPromise = this.sendMessage(customerPhone, customerMsg);

    // Merchant Message
    let merchantPromise = Promise.resolve(true);
    if (merchantPhone) {
      const merchantMsg = `New Payment Received 💰\n\nAmount: ${currency} ${amount}\nFrom: ${customerPhone}\nRef: ${reference}\n${receiptSnippet}\nYour wallet balance has been updated.`;
      merchantPromise = this.sendMessage(merchantPhone, merchantMsg);
    }

    await Promise.allSettled([customerPromise, merchantPromise]);
  }
}
