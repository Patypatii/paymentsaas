import { pool } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { WebhookDispatcher } from '../webhooks/webhook.dispatcher';

export class CallbackProcessor {
  /**
   * Process Daraja STK Push callback
   */
  static async processSTKCallback(payload: any): Promise<void> {
    try {
      const callback = payload.Body?.stkCallback;
      if (!callback) {
        logger.error('Invalid callback payload', { payload });
        return;
      }

      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = callback.ResultCode;
      const resultDesc = callback.ResultDesc;

      // Find transaction by checkout request ID
      const transactionResult = await pool.query(
        `SELECT t.*, m.id as merchant_id
         FROM transactions t
         JOIN merchants m ON t.merchant_id = m.id
         WHERE t.mpesa_checkout_request_id = $1`,
        [checkoutRequestId]
      );

      if (transactionResult.rows.length === 0) {
        logger.warn('Transaction not found for callback', { checkoutRequestId });
        return;
      }

      const transaction = transactionResult.rows[0];
      let status = 'FAILED';
      let mpesaReceipt = null;

      if (resultCode === '0') {
        // Success
        status = 'SUCCESS';
        const callbackMetadata = callback.CallbackMetadata;
        if (callbackMetadata?.Item) {
          const items = callbackMetadata.Item;
          const receiptItem = items.find((item: any) => item.Name === 'MpesaReceiptNumber');
          if (receiptItem) {
            mpesaReceipt = receiptItem.Value;
          }
        }
      }

      // Update transaction
      await pool.query(
        `UPDATE transactions 
         SET status = $1, mpesa_receipt = $2, callback_received_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [status, mpesaReceipt, transaction.id]
      );

      logger.info('Transaction updated from callback', {
        transactionId: transaction.transaction_id,
        status,
        mpesaReceipt,
      });

      // Trigger webhook dispatch
      await WebhookDispatcher.dispatchTransactionUpdate(
        transaction.merchant_id,
        {
          transactionId: transaction.transaction_id,
          status,
          mpesaReceipt,
          amount: transaction.amount,
        }
      );
    } catch (error: any) {
      logger.error('Callback processing failed', {
        error: error.message,
        payload,
      });
      // Don't throw - we don't want to fail the callback endpoint
    }
  }
}
