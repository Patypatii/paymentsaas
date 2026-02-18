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
      console.log(`--- IDEMPOTENCY HIT ---`);
      console.log(`Request matches a previous attempt within the last 24h. Returning cached response: ${JSON.stringify(idempotencyCheck.cachedResponse)}`);
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
      // Find channel by ID or Alias
      const query = mongoose.Types.ObjectId.isValid(request.channelId)
        ? { _id: request.channelId, merchantId, status: 'ACTIVE' }
        : { alias: request.channelId, merchantId, status: 'ACTIVE' };

      channel = await ChannelModel.findOne(query);

      if (!channel) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Active payment channel not found', 404);
      }

      // Handle Channels Explicitly
      if (channel.type === 'BANK') {
        // BANK: uses channel number as paybill, account number as reference
        shortcode = channel.number;
        request.reference = channel.accountNumber || request.reference;
        request.description = `Settle to ${channel.bankName}`;
      } else if (channel.type === 'TILL') {
        // TILL: uses channel number as Till Number (Store Number)
        shortcode = channel.number;
        // For Buy Goods, AccountReference isn't primary, but we keep the unique reference
      } else if (channel.type === 'PAYBILL') {
        // PAYBILL: uses channel number
        shortcode = channel.number;
      } else {
        // Fallback / Default
        shortcode = channel.number;
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

    // Check Wallet Balance (New Logic)
    const { WalletService } = await import('../wallet/wallet.service');
    const { allowed, fee, balance } = await WalletService.hasSufficientFunds(merchantId, request.amount);

    if (!allowed) {
      throw new AppError(
        ErrorCode.PAYMENT_REQUIRED,
        `Insufficient wallet credits. Fee: KES ${fee}, Balance: KES ${balance}. Please top up your wallet.`,
        402
      );
    }



    // 1. Create New Payment Record
    // We always create a new record to maintain accurate history and timestamps.
    // If you need idempotency, it should be handled at the API level (which we already do).
    const transaction = await PaymentModel.create({
      merchantId,
      amount: request.amount,
      currency: 'KES',
      status: 'INITIATED',
      provider: 'MPESA',
      reference: request.reference,
      customerPhone: request.phone,

      description: request.description || 'Payment',
      channelId: request.channelId ? new mongoose.Types.ObjectId(request.channelId) : undefined,
      callbackUrl: request.callbackUrl,
    });

    try {
      // 2. Initiate STK Push (Collection via Platform Master Shortcode)
      // Determine Transaction Type based on Channel Type
      // TILL -> CustomerBuyGoodsOnline
      // PAYBILL / BANK -> CustomerPayBillOnline
      const transactionType = (channel && channel.type === 'TILL')
        ? 'CustomerBuyGoodsOnline'
        : 'CustomerPayBillOnline';

      const stkResponse = await STKPushService.initiate(
        request,
        shortcode, // This is the merchant's target shortcode for tracking, but STK service uses master internally
        transactionType
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
      UsageTracker.trackTransaction(merchantId, request.amount).catch(
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
    const query = {
      merchantId
    };

    const total = await PaymentModel.countDocuments(query);
    const transactions = await PaymentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('channelId');

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

    // Get last month's revenue for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get Wallet Balance
    const { WalletService } = await import('../wallet/wallet.service');
    const { WalletTransactionModel } = await import('../wallet/wallet.model');
    const wallet = await WalletService.getWallet(merchantId);

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [statsResult] = await PaymentModel.aggregate([
      {
        $match: {
          merchantId: new mongoose.Types.ObjectId(merchantId),
          reference: { $not: /^TOPUP-/ }, // Exclude wallet topups from revenue
          createdAt: { $gte: startOfYear > sixMonthsAgo ? sixMonthsAgo : startOfYear }
        }
      },
      {
        $facet: {
          "yearly": [
            { $match: { createdAt: { $gte: startOfYear } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] } }
              }
            }
          ],
          "currentMonth": [
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] } },
                totalCount: { $sum: 1 },
                successCount: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } }
              }
            }
          ],
          "lastMonth": [
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] } }
              }
            }
          ],
          "history": [
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                revenue: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] } },
                transactions: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ]
        }
      }
    ]);

    const currentStats = statsResult.currentMonth[0] || { totalRevenue: 0, totalCount: 0, successCount: 0 };
    const lastMonthStats = statsResult.lastMonth[0] || { totalRevenue: 0 };
    const yearlyStats = statsResult.yearly[0] || { totalRevenue: 0 };

    const yearlyRevenue = yearlyStats.totalRevenue;
    const currentMonthRevenue = currentStats.totalRevenue;
    const totalCount = currentStats.totalCount;
    const averageTransaction = currentStats.successCount > 0 ? currentMonthRevenue / currentStats.successCount : 0;

    const revenueChange = lastMonthStats.totalRevenue > 0
      ? ((currentMonthRevenue - lastMonthStats.totalRevenue) / lastMonthStats.totalRevenue) * 100
      : 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const historicalEntry = statsResult.history.find((h: any) => h._id.month === m && h._id.year === y);

      chartData.push({
        name: monthNames[m - 1],
        amount: historicalEntry?.revenue || 0,
        transactions: historicalEntry?.transactions || 0
      });
    }

    const walletOutboundResult = await WalletTransactionModel.aggregate([
      {
        $match: {
          merchantId: new mongoose.Types.ObjectId(merchantId),
          type: 'FEE',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalOutbound: { $sum: { $abs: "$amount" } }
        }
      }
    ]);

    const inbound = currentMonthRevenue;
    const outbound = walletOutboundResult[0]?.totalOutbound || 0;

    return {
      stats: [
        {
          name: 'Total Revenue',
          value: `KES ${yearlyRevenue.toLocaleString()}`,
          change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
          changeType: revenueChange >= 0 ? 'increase' : 'decrease'
        },
        {
          name: 'Active Transactions',
          value: totalCount.toString(),
          change: 'This Month',
          changeType: 'increase'
        },
        {
          name: 'Wallet Balance',
          value: `${wallet.currency} ${wallet.balance.toLocaleString()}`,
          change: 'Available',
          changeType: 'increase'
        },
        {
          name: 'Average Transaction',
          value: `KES ${averageTransaction.toLocaleString()}`,
          change: 'Successful',
          changeType: 'increase'
        },
      ],
      charts: {
        monthly: chartData,
        flow: [
          { name: 'Inbound', value: inbound, color: '#10B981' },
          { name: 'Outbound', value: outbound, color: '#EF4444' }
        ]
      }
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
      channel: doc.channelId ? {
        name: doc.channelId.alias || doc.channelId.name,
        number: doc.channelId.number,
        accountNumber: doc.channelId.accountNumber,
        type: doc.channelId.type,
      } : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
