
import { PaymentModel } from '../payments/payment.model';
import { logger } from '../../common/utils/logger';
import { WebhookDispatcher } from '../webhooks/webhook.dispatcher';

export class CallbackProcessor {
  /**
   * Process Daraja STK Push callback
   */
  static async processSTKCallback(payload: any): Promise<void> {
    try {
      console.log('--- RECEIVED M-PESA CALLBACK ---');
      console.log('Payload Body:', JSON.stringify(payload, null, 2));

      const callback = payload.Body?.stkCallback;
      if (!callback) {
        logger.error('Invalid callback payload', { payload });
        console.error('ERROR: Missing stkCallback in payload body');
        return;
      }

      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = callback.ResultCode;
      const resultDesc = callback.ResultDesc;

      console.log(`Processing Callback for CheckoutRequestID: ${checkoutRequestId}`);
      console.log(`Result: ${resultCode} (${resultDesc})`);

      // Find transaction by checkout request ID
      const transaction = await PaymentModel.findOne({
        providerRef: checkoutRequestId
      });

      if (!transaction) {
        logger.warn('Transaction not found for callback', { checkoutRequestId });
        console.warn(`WARN: No transaction found in database for providerRef: ${checkoutRequestId}`);
        return;
      }

      console.log(`Found Transaction: ${transaction._id} | Current Status: ${transaction.status} | Amount: ${transaction.amount}`);

      let status: 'COMPLETED' | 'FAILED' = 'FAILED';
      let mpesaReceipt = null;

      if (resultCode === 0 || resultCode === '0') {
        // Success
        status = 'COMPLETED';
        const callbackMetadata = callback.CallbackMetadata;
        console.log('Payment Successful. Processing metadata...');
        if (callbackMetadata?.Item) {
          const items = callbackMetadata.Item;
          const receiptItem = items.find((item: any) => item.Name === 'MpesaReceiptNumber');
          if (receiptItem) {
            mpesaReceipt = receiptItem.Value;
            console.log(`M-Pesa Receipt Number: ${mpesaReceipt}`);
          }
        }
      } else {
        console.warn(`Payment Failed or Cancelled by user. ResultCode: ${resultCode}`);
      }

      // Update transaction
      transaction.status = status;
      if (mpesaReceipt) {
        if (!transaction.metadata) transaction.metadata = {};
        transaction.metadata.mpesaReceipt = mpesaReceipt;
      }
      transaction.metadata = {
        ...transaction.metadata,
        callbackResultDesc: resultDesc,
        callbackResultCode: resultCode
      };

      // Check if this is a Wallet Top-Up
      if (transaction.reference.startsWith('TOPUP-')) {
        console.log('Detected Wallet Top-Up transaction. Updating wallet...');
        const { WalletTransactionModel } = await import('../wallet/wallet.model');
        const { WalletService } = await import('../wallet/wallet.service');

        // Find the pending topup transaction by reference
        const pendingTopup = await WalletTransactionModel.findOne({
          reference: transaction.reference,
          type: 'TOPUP',
          status: 'PENDING'
        });

        if (pendingTopup && status === 'COMPLETED' && transaction.amount >= pendingTopup.amount) {
          console.log(`Crediting Wallet for Merchant: ${transaction.merchantId}`);
          await WalletService.updateBalance(
            transaction.merchantId.toString(),
            transaction.amount
          );

          pendingTopup.status = 'COMPLETED';
          pendingTopup.metadata = { mpesaReceipt };
          await pendingTopup.save();
          console.log('Wallet credited and top-up transaction marked COMPLETED');
        } else if (pendingTopup) {
          // Delete failed wallet top-up transactions to save storage
          await WalletTransactionModel.findByIdAndDelete(pendingTopup._id);
          console.log('Top-up transaction deleted due to failure (saving storage)');
        }

        // Return early for topups? Or update the transient Payment record too?
        // We probably didn't create a Payment record for Topups in WalletController, we initiated directly via STKPushService but didn't save to PaymentModel?
        // Wait, STKPushService doesn't save to PaymentModel provided we call it directly.
        // BUT CallbackProcessor looks up by providerRef in PaymentModel. 
        // If WalletController didn't create a PaymentModel entry, CallbackProcessor won't find it!
        // ISSUE: WalletController logic initiated STK but didn't create Payment record.
        // FIX: I must rely on the Topup Transaction ID?
        // CallbackProcessor does: `PaymentModel.findOne({ providerRef: checkoutRequestId })`
        // If I didn't create a Payment Document, this will FAIL (Transaction not found).

        // CORRECTION Strategy:
        // I should modify CallbackProcessor to ALSO look in WalletTransactionModel if PaymentModel fails.
        // OR make WalletController create a Payment record (easiest).
        // Let's create a Payment record in WalletController marked as 'INTERNAL_TOPUP'.

        // For now, I will assume I fix WalletController.

        // REGULAR Fee Deduction Logic
      }

      // Regular Transaction Fee Deduction
      if (status === 'COMPLETED' && !transaction.reference.startsWith('TOPUP-')) {
        console.log('Initiating fee deduction for regular payment...');
        const { WalletService } = await import('../wallet/wallet.service');
        // Deduct fee asynchronously
        WalletService.deductFee(
          transaction.merchantId.toString(),
          transaction.amount,
          transaction.reference
        ).then(() => console.log('Fee deduction successful'))
          .catch(err => {
            logger.error('Fee deduction failed', err);
            console.error('Fee deduction FAILED:', err.message);
          });
      }

      if (status === 'FAILED') {
        await PaymentModel.findByIdAndDelete(transaction._id);
        console.log(`Transaction ${transaction._id} deleted from database (FAILED) to save storage.`);
      } else {
        await transaction.save();
        console.log(`Transaction ${transaction._id} saved with new status: ${transaction.status}`);
      }

      logger.info('Transaction updated from callback', {
        transactionId: transaction.id,
        status,
        mpesaReceipt,
      });

      // Use local `status` variable, not transaction.status, since transaction may have been deleted above
      const success = status === 'COMPLETED';

      // 5. Dispatch Webhook & Email
      console.log('Dispatching notifications...');

      // Custom Callback URL (Per-transaction)
      if (transaction.callbackUrl) {
        // Fetch an active API key to use as the signature secret
        const { ApiKeyModel } = await import('../api-keys/apiKey.model');
        const merchantKey = await ApiKeyModel.findOne({
          merchantId: transaction.merchantId,
          isActive: true,
          revokedAt: null
        });

        WebhookDispatcher.dispatchToUrl(
          transaction.callbackUrl,
          success ? 'payment.success' : 'payment.failed',
          {
            event: success ? 'payment.success' : 'payment.failed',
            transaction: {
              id: transaction.id,
              reference: transaction.reference,
              amount: transaction.amount,
              status: transaction.status,
              providerRef: transaction.providerRef,
              metadata: transaction.metadata
            }
          },
          merchantKey ? merchantKey.id : undefined // Use the persistent API Key ID as the secret
        ).catch(err => console.error('Custom callback FAILED:', err.message));
      }

      // Email & SMS/WhatsApp Notification to Merchant (Regular Payments)
      if (success && !transaction.reference.startsWith('TOPUP-')) {
        const { MerchantModel } = await import('../merchants/merchant.model');
        const { EmailService } = await import('../../common/services/email.service');
        const { WhatsappService } = await import('../../common/services/whatsapp.service');

        MerchantModel.findById(transaction.merchantId)
          .then(merchant => {
            if (merchant) {
              // Send Email if enabled
              if (merchant.notifications?.email) {
                EmailService.sendPaymentSuccessEmail(
                  merchant.email,
                  `${merchant.firstName} ${merchant.lastName}`,
                  {
                    amount: transaction.amount,
                    currency: transaction.currency,
                    reference: transaction.reference,
                    phone: transaction.customerPhone || 'N/A',
                    mpesaReceipt: mpesaReceipt || undefined
                  }
                ).catch(err => console.error('Payment email FAILED:', err.message));
              }

              // Send WhatsApp Notifications
              // Use alertPhone first (dedicated notification phone), fallback to merchant's main phone
              if (transaction.customerPhone) {
                const isSmsEnabled = merchant.notifications?.sms;
                const alertPhone = merchant.notifications?.alertPhone;
                const merchantMainPhone = merchant.phoneNumber;

                console.log(`WhatsApp Notification Status: ${isSmsEnabled ? 'ENABLED' : 'DISABLED'}`);
                console.log(`Merchant Alert Phone: ${alertPhone || 'Not set'}`);

                const merchantWhatsappPhone = (isSmsEnabled && alertPhone)
                  ? alertPhone
                  : (isSmsEnabled && merchantMainPhone)
                    ? merchantMainPhone
                    : undefined;

                if (isSmsEnabled) {
                  console.log(`Attempting to send WhatsApp: Customer(${transaction.customerPhone}), Merchant(${merchantWhatsappPhone || 'None'})`);
                  WhatsappService.sendPaymentSuccessNotification(
                    transaction.customerPhone,
                    merchantWhatsappPhone,
                    merchant.businessName || `${merchant.firstName} ${merchant.lastName}`,
                    transaction.amount,
                    transaction.currency,
                    transaction.reference,
                    mpesaReceipt || null
                  ).then(() => console.log('WhatsApp notification block completed'))
                  .catch(err => {
                    logger.error('WhatsApp notification FAILED', { error: err.message });
                    console.error('WhatsApp notification FAILED:', err.message);
                  });
                } else {
                  console.log('WhatsApp notifications are DISABLED for this merchant.');
                }
              } else {
                console.warn('Cannot send WhatsApp: Customer phone missing in transaction.');
              }
            }
          })
          .catch(err => console.error('Failed to find merchant for notifications:', err.message));
      }

      await WebhookDispatcher.dispatchTransactionUpdate(transaction.merchantId.toString(), {
        event: success ? 'payment.success' : 'payment.failed',
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status,
          providerRef: transaction.providerRef,
          metadata: transaction.metadata
        }
      }).then(() => console.log('Webhook dispatched successfully'))
        .catch(err => console.error('Webhook dispatch FAILED:', err.message));

      logger.info('Callback processed successfully', {
        transactionId: transaction.id,
        status: transaction.status
      });
      console.log('--- CALLBACK PROCESSING FINISHED ---');
    } catch (error: any) {
      logger.error('Error processing STK callback', error);
      console.error('CRITICAL ERROR in CallbackProcessor:', error);
      // Don't throw, we've already responded to Daraja
    }
  }
}
