import mongoose from 'mongoose';
import { PaymentModel } from './payment.model';
import { STKPushService } from './stkPush.service';
import { STKPushRequest, PaymentStatus } from './payment.types';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { MerchantModel } from '../merchants/merchant.model';
import { ChannelModel } from '../channels/channel.model';
import { generateIdempotencyKey, checkIdempotency, storeIdempotency } from '../../common/utils/idempotency';
import { logger } from '../../common/utils/logger';
import { UsageTracker } from '../subscriptions/usage.tracker';
import { BillingService } from '../subscriptions/billing.service';
import { PLANS } from '../../common/constants/plans';

export class PaymentService {
  /**
   * Initiate STK Push payment
   */
  static async initiateSTKPush(
    merchantId: string,
    request: STKPushRequest
  ): Promise<{
    transactionId: string;
    status: PaymentStatus;
  }> {
    // Check idempotency
    const idempotencyKey = generateIdempotencyKey(merchantId, 'POST', '/payments/stk-push', request);
    const idempotencyCheck = await checkIdempotency(idempotencyKey);

    if (idempotencyCheck.isDuplicate) {
      return idempotencyCheck.cachedResponse;
    }

    // Get merchant
    const merchant = await MerchantModel.findById(merchantId);
    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }

    if (merchant.status !== 'ACTIVE') {
      let message = 'Merchant account is not active';

      if (merchant.status === 'PENDING') {
        const { KYCDocumentModel } = await import('../kyc/kyc.model');
        const docCount = await KYCDocumentModel.countDocuments({ merchantId });

        if (docCount === 0) {
          message = 'You need to submit your KYC documents first. Visit the Verification page to get started.';
        } else {
          const pendingDocs = await KYCDocumentModel.countDocuments({ merchantId, status: 'PENDING' });
          if (pendingDocs > 0) {
            message = 'Your account is currently pending verification. You can initiate live payments once your KYC is approved.';
          } else {
            message = 'You have draft KYC documents. Please go to the Verification page and finalize your submission.';
          }
        }
      } else if (merchant.status === 'SUSPENDED') {
        message = 'Your account has been suspended. Please contact support for more information.';
      } else if (merchant.status === 'REJECTED') {
        message = 'Your account verification was rejected. Please review your KYC details on the Verification page.';
      }

      throw new AppError(ErrorCode.MERCHANT_INACTIVE, message, 403);
    }

    // Determine which shortcode to use
    let shortcode = merchant.shortcode;
    let channel: any = null;

    if (request.channelId) {
      channel = await ChannelModel.findOne({
        _id: request.channelId,
        merchantId,
        status: 'ACTIVE'
      });

      if (!channel) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Active payment channel not found', 404);
      }

      shortcode = channel.number;

      // Handle Bank Account Channels
      if (channel.type === 'BANK') {
        // For Bank Channels, we MUST use the bank account number as AccountReference
        // This ensures money lands in the correct account.
        request.reference = channel.accountNumber || request.reference;
        request.description = `Settle to ${channel.bankName}`;
      }
    }

    // Validate we have a shortcode
    if (!shortcode) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Merchant shortcode or channel not configured',
        400
      );
    }

    // Check usage quota
    const subscription = await BillingService.getSubscription(merchantId);
    const plan = subscription.plan || PLANS[merchant.planId as keyof typeof PLANS];
    const quotaCheck = await UsageTracker.checkQuota(merchantId, plan.monthlyTransactionLimit);

    if (!quotaCheck.allowed) {
      throw new AppError(
        ErrorCode.QUOTA_EXCEEDED,
        `Monthly transaction limit exceeded. Used: ${quotaCheck.current}/${quotaCheck.limit}`,
        429
      );
    }

    // 1. Create Payment Intent (State: INITIATED)
    const transaction = await PaymentModel.create({
      merchantId,
      amount: request.amount,
      currency: 'KES',
      status: 'INITIATED',
      provider: 'MPESA',
      reference: request.reference,
      customerPhone: request.phone,
      description: request.description,
      channelId: request.channelId ? new mongoose.Types.ObjectId(request.channelId) : undefined,
    });

    try {
      // 2. Initiate STK Push (Collection via Platform Master Shortcode)
      // We always use CustomerPayBillOnline for our master paybill
      const stkResponse = await STKPushService.initiate(
        request,
        shortcode, // This is the merchant's target shortcode for tracking, but STK service uses master internally
        'CustomerPayBillOnline'
      );

      // 3. Update to STK_SENT
      transaction.status = 'STK_SENT';
      transaction.providerRef = stkResponse.checkoutRequestId;
      await transaction.save();

      const response = {
        transactionId: transaction.id,
        status: stkResponse.status,
      };

      // Store idempotency result
      await storeIdempotency(idempotencyKey, response);

      // Track usage (async, don't block)
      UsageTracker.trackTransaction(merchantId, request.amount, subscription.subscription?.id).catch(
        (error) => logger.error('Usage tracking failed', error)
      );

      return response;
    } catch (error: any) {
      // Update intent to FAILED
      transaction.status = 'FAILED';
      transaction.metadata = { ...transaction.metadata, error: error.message };
      await transaction.save();
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(merchantId: string, transactionId: string): Promise<any> {
    // transactionId could be internal _id or provider ref?
    // Expecting internal _id usually.
    const transaction = await PaymentModel.findOne({
      _id: transactionId,
      merchantId
    });

    if (!transaction) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Transaction not found', 404);
    }

    return this.mapTransaction(transaction);
  }

  /**
   * List transactions for a merchant
   */
  static async listTransactions(
    merchantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ transactions: any[]; total: number }> {
    const total = await PaymentModel.countDocuments({ merchantId });

    const transactions = await PaymentModel.find({ merchantId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return {
      transactions: transactions.map(this.mapTransaction),
      total,
    };
  }

  /**
   * Get dashboard statistics for a merchant
   */
  static async getDashboardStats(merchantId: string): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total revenue (successful transactions this month)
    const revenueStats = await PaymentModel.aggregate([
      {
        $match: {
          merchantId: new mongoose.Types.ObjectId(merchantId),
          status: 'COMPLETED',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total transactions and success rate
    const totalCount = await PaymentModel.countDocuments({
      merchantId: new mongoose.Types.ObjectId(merchantId),
      createdAt: { $gte: startOfMonth }
    });

    const completedCount = await PaymentModel.countDocuments({
      merchantId: new mongoose.Types.ObjectId(merchantId),
      status: 'COMPLETED',
      createdAt: { $gte: startOfMonth }
    });

    const totalRevenue = revenueStats[0]?.totalAmount || 0;
    const successfulTransactions = revenueStats[0]?.count || 0;
    const successRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const averageTransaction = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;

    // Get last month's revenue for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthRevenueStats = await PaymentModel.aggregate([
      {
        $match: {
          merchantId: new mongoose.Types.ObjectId(merchantId),
          status: 'COMPLETED',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const lastMonthRevenue = lastMonthRevenueStats[0]?.totalAmount || 0;
    const revenueChange = lastMonthRevenue > 0
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      stats: [
        {
          name: 'Total Revenue',
          value: `KES ${totalRevenue.toLocaleString()}`,
          change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
          changeType: revenueChange >= 0 ? 'increase' : 'decrease'
        },
        {
          name: 'Active Transactions',
          value: totalCount.toString(),
          change: '+0%', // Placeholder for now
          changeType: 'increase'
        },
        {
          name: 'Success Rate',
          value: `${successRate.toFixed(1)}%`,
          change: '+0%',
          changeType: 'increase'
        },
        {
          name: 'Average Transaction',
          value: `KES ${averageTransaction.toLocaleString()}`,
          change: '+0%',
          changeType: 'increase'
        },
      ]
    };
  }

  private static mapTransaction(doc: any): any {
    return {
      id: doc.id,
      transactionId: doc.providerRef, // Mapping providerRef back to transactionId for frontend consistency? 
      // Original SQL had 'transaction_id' column which stored stkResponse.transactionId.
      // In my create above I stored stkResponse.checkoutRequestId in providerRef.
      // I should be careful. STK Service returns transactionId (usually CheckoutRequestID).
      // So providerRef is the correct mapping.
      phone: doc.customerPhone,
      amount: doc.amount,
      currency: doc.currency,
      reference: doc.reference,
      description: doc.description,
      status: doc.status,
      // mpesaReceipt: row.mpesa_receipt, // Schema doesn't have mpesaReceipt yet. 
      // Add it to schema or metadata?
      // I'll add it to metadata for now or ignore.
      mpesaReceipt: doc.metadata?.mpesaReceipt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
