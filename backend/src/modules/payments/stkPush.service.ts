import { getDarajaAccessToken, getDarajaClient, darajaConfig } from '../../config/daraja';
import { logger } from '../../common/utils/logger';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { STKPushRequest, STKPushResponse, DarajaSTKResponse, PaymentStatus } from './payment.types';

export class STKPushService {
  /**
   * Generate Daraja password
   */
  private static generatePassword(shortcode: string, timestamp: string): string {
    const password = Buffer.from(
      `${shortcode}${darajaConfig.passkey}${timestamp}`
    ).toString('base64');
    return password;
  }

  /**
   * Initiate STK Push
   */
  static async initiate(
    request: STKPushRequest,
    merchantShortcode: string,
    transactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline' = 'CustomerPayBillOnline'
  ): Promise<STKPushResponse> {
    try {
      const accessToken = await getDarajaAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

      // IMPORTANT: Use our PLATFORM shortcode for collection to match our credentials
      const masterShortcode = darajaConfig.shortcode;

      if (!masterShortcode || masterShortcode.trim() === '') {
        throw new AppError(
          ErrorCode.DARAJA_ERROR,
          'Platform master shortcode is not configured in environment variables (DARAJA_SHORTCODE)',
          500
        );
      }

      const password = this.generatePassword(masterShortcode, timestamp);

      // Format phone number (ensure it starts with 254)
      let phone = request.phone;
      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      } else if (!phone.startsWith('254')) {
        phone = '254' + phone;
      }

      const payload = {
        BusinessShortCode: masterShortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.round(request.amount),
        PartyA: phone,
        PartyB: merchantShortcode, // Send to the specific Channel/Paybill (e.g. Bank Paybill)
        PhoneNumber: phone,
        CallBackURL: darajaConfig.callbackUrl,
        AccountReference: request.reference.substring(0, 14), // Increased limit for Bank Accounts
        TransactionDesc: (request.description && request.description.trim().length > 0) ? request.description.substring(0, 13) : 'Payment',
      };

      logger.info('Daraja STK Push Payload', {
        initiator: masterShortcode,
        targetPaybill: merchantShortcode,
        TransactionType: payload.TransactionType,
        AccountReference: payload.AccountReference,
        hasToken: !!accessToken
      });

      const darajaClient = getDarajaClient();
      const response = await darajaClient.post<DarajaSTKResponse>(
        '/mpesa/stkpush/v1/processrequest',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.ResponseCode !== '0') {
        logger.error('Daraja STK Push failed', {
          response: response.data,
          request,
        });
        throw new AppError(
          ErrorCode.DARAJA_ERROR,
          response.data.ResponseDescription || 'STK Push failed',
          400
        );
      }

      return {
        transactionId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        status: PaymentStatus.PENDING,
      };
    } catch (error: any) {
      // Check for Daraja error response (Express/Axios error)
      const darajaError = error.response?.data?.errorMessage ||
        error.response?.data?.ResponseDescription ||
        error.message;

      logger.error('STK Push initiation failed', {
        error: darajaError,
        request,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorCode.DARAJA_ERROR,
        darajaError || 'Failed to initiate STK Push',
        error.response?.status || 500
      );
    }
  }
}
