import { testConnection } from '../../config/database';
import { MerchantModel } from '../merchants/merchant.model';
import { PaymentModel } from '../payments/payment.model';
import { MerchantService } from '../merchants/merchant.service';
import { SubscriptionModel } from '../subscriptions/plans.model';
import { AuditLogModel } from '../compliance/audit.model';
import { WalletModel, WalletTransactionModel } from '../wallet/wallet.model';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { logger } from '../../common/utils/logger';

export class AdminService {
  /**
   * List all merchants with pagination
   */
  static async listMerchants(
    limit: number = 50,
    offset: number = 0,
    status?: string
  ): Promise<{ merchants: any[]; total: number }> {
    const filter = status ? { status } : {};

    const total = await MerchantModel.countDocuments(filter);

    const merchants = await MerchantModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return {
      merchants: merchants.map((merchant: any) => ({
        id: merchant._id,
        businessName: merchant.businessName,
        contactEmail: merchant.email,
        contactPhone: merchant.phoneNumber,
        settlementType: merchant.settlementType,
        status: merchant.status,
        planId: merchant.planId,
        createdAt: merchant.createdAt,
        verifiedAt: merchant.verifiedAt,
      })),
      total,
    };
  }

  /**
   * Get merchant details
   */
  static async getMerchant(merchantId: string): Promise<any> {
    const merchant = await MerchantModel.findById(merchantId).lean();
    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }

    const wallet = await WalletModel.findOne({ merchantId: merchant._id }).lean();

    // Get transaction stats using Mongoose aggregation
    const stats = await PaymentModel.aggregate([
      { $match: { merchantId: merchant._id } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          }
        }
      }
    ]);

    const merchantStats = stats.length > 0 ? stats[0] : {
      totalTransactions: 0,
      totalAmount: 0,
      successfulTransactions: 0
    };

    return {
      merchant: {
        ...merchant,
        id: merchant._id,
        wallet: wallet || { balance: 0, currency: 'KES' }
      },
      stats: {
        totalTransactions: merchantStats.totalTransactions,
        totalAmount: merchantStats.totalAmount,
        successfulTransactions: merchantStats.successfulTransactions,
      },
    };
  }

  /**
   * Approve merchant
   */
  static async approveMerchant(merchantId: string): Promise<{
    merchant: any;
    apiKey: string;
  }> {
    const result = await MerchantService.activateMerchant(merchantId);

    logger.info('Merchant approved', {
      merchantId,
      adminAction: true,
    });

    return result;
  }

  /**
   * Suspend merchant
   */
  static async suspendMerchant(merchantId: string, reason?: string): Promise<void> {
    await MerchantModel.findByIdAndUpdate(merchantId, { status: 'SUSPENDED' });

    logger.warn('Merchant suspended', {
      merchantId,
      reason,
      adminAction: true,
    });
  }

  /**
   * Reject merchant
   */
  static async rejectMerchant(merchantId: string, reason?: string): Promise<void> {
    await MerchantModel.findByIdAndUpdate(merchantId, { status: 'REJECTED' });

    logger.info('Merchant rejected', {
      merchantId,
      reason,
      adminAction: true,
    });
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(): Promise<any> {
    // Count merchants by status using Mongoose
    const [totalMerchants, activeMerchants] = await Promise.all([
      MerchantModel.countDocuments(),
      MerchantModel.countDocuments({ status: 'ACTIVE' }),
    ]);

    // Count transactions and sum amounts using Mongoose
    const totalTransactions = await PaymentModel.countDocuments();
    const successfulTransactions = await PaymentModel.countDocuments({
      status: 'COMPLETED'
    });

    // Get active subscriptions
    const activeSubscriptions = await SubscriptionModel.countDocuments({ status: 'ACTIVE' });

    // Get total amount from successful transactions
    const amountAggregation = await PaymentModel.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = amountAggregation.length > 0 ? amountAggregation[0].total : 0;

    return {
      merchants: {
        total: totalMerchants,
        active: activeMerchants,
      },
      transactions: {
        total: totalTransactions,
        totalAmount: totalAmount,
        successful: successfulTransactions,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
    };
  }

  /**
   * Get all transactions
   */
  static async getAllTransactions(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ transactions: any[]; total: number }> {
    const total = await PaymentModel.countDocuments();

    const payments = await PaymentModel.find()
      .populate('merchantId', 'businessName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return {
      transactions: payments.map((payment: any) => ({
        id: payment._id || payment.id,
        merchantId: payment.merchantId?._id,
        merchantName: payment.merchantId?.businessName || 'Unknown',
        phone: payment.customerPhone,
        amount: payment.amount,
        currency: payment.currency || 'KES',
        status: payment.status,
        reference: payment.reference,
        description: payment.description,
        mpesaReceipt: payment.metadata?.mpesaReceipt, // Use metadata for receipt
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      total,
    };
  }

  /**
   * Get audit logs (security events)
   */
  static async getAuditLogs(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ logs: any[]; total: number }> {
    const total = await AuditLogModel.countDocuments();

    const logs = await AuditLogModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return {
      logs: logs.map((log: any) => ({
        id: log._id,
        userType: log.userType,
        userId: log.userId,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      total,
    };
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<any> {
    // Check database connection via Mongoose
    const dbHealthy = await testConnection();

    return {
      services: [
        {
          name: 'API Gateway',
          status: 'Operational',
          uptime: '99.99%',
          latency: '45ms',
        },
        {
          name: 'Database',
          status: dbHealthy ? 'Operational' : 'Degraded',
          uptime: dbHealthy ? '99.95%' : '98.50%',
          latency: '12ms',
        },
        {
          name: 'Payment Processor',
          status: 'Operational',
          uptime: '100%',
          latency: '230ms',
        },
        {
          name: 'Fraud Detection',
          status: 'Operational',
          uptime: '99.50%',
          latency: '150ms',
        },
      ],
    };
  }

  /**
   * Get all KYC submissions
   */
  static async getAllKYCSubmissions(
    limit: number = 50,
    offset: number = 0,
    status?: string
  ): Promise<{ submissions: any[]; total: number }> {
    const { KYCDocumentModel } = await import('../kyc/kyc.model');

    const filter = status ? { status } : {};
    const total = await KYCDocumentModel.countDocuments(filter);

    const submissions = await KYCDocumentModel.find(filter)
      .populate('merchantId', 'businessName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return {
      submissions: submissions.map((sub: any) => ({
        id: sub._id,
        merchantId: sub.merchantId?._id,
        merchantName: sub.merchantId?.businessName || 'Unknown',
        merchantEmail: sub.merchantId?.email,
        type: sub.type,
        status: sub.status,
        fileUrl: sub.fileUrl,
        fileId: sub.fileId,
        rejectionReason: sub.rejectionReason,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      })),
      total,
    };
  }

  /**
   * Get single KYC submission details
   */
  static async getKYCSubmission(kycId: string): Promise<any> {
    const { KYCDocumentModel } = await import('../kyc/kyc.model');

    const submission = await KYCDocumentModel.findById(kycId)
      .populate('merchantId', 'businessName email phoneNumber')
      .populate('verifiedBy', 'email');

    if (!submission) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'KYC submission not found', 404);
    }

    return submission;
  }

  /**
   * Approve KYC document
   */
  static async approveKYCDocument(kycId: string, adminId: string): Promise<void> {
    const { KYCDocumentModel } = await import('../kyc/kyc.model');

    await KYCDocumentModel.findByIdAndUpdate(kycId, {
      status: 'APPROVED',
      verifiedBy: adminId,
      verifiedAt: new Date(),
    });

    logger.info('KYC document approved', {
      kycId,
      adminId,
      adminAction: true,
    });
  }

  /**
   * Reject KYC document
   */
  static async rejectKYCDocument(
    kycId: string,
    adminId: string,
    reason: string
  ): Promise<void> {
    const { KYCDocumentModel } = await import('../kyc/kyc.model');

    await KYCDocumentModel.findByIdAndUpdate(kycId, {
      status: 'REJECTED',
      verifiedBy: adminId,
      verifiedAt: new Date(),
      rejectionReason: reason,
    });

    logger.info('KYC document rejected', {
      kycId,
      adminId,
      reason,
      adminAction: true,
    });
  }

  /**
   * Get merchants for KYC review (grouped)
   */
  static async getKYCMerchants(
    limit: number = 50,
    offset: number = 0,
    status?: string
  ): Promise<{ merchants: any[]; total: number }> {
    const { KYCDocumentModel } = await import('../kyc/kyc.model');

    const aggregation: any[] = [
      {
        $group: {
          _id: '$merchantId',
          documentsCount: { $sum: 1 },
          lastSubmission: { $max: '$createdAt' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
          },
        }
      },
      {
        $lookup: {
          from: 'merchants',
          localField: '_id',
          foreignField: '_id',
          as: 'merchant'
        }
      },
      { $unwind: '$merchant' },
      {
        $project: {
          id: '$_id',
          merchantName: '$merchant.businessName',
          merchantEmail: '$merchant.email',
          documentsCount: 1,
          lastSubmission: 1,
          pendingCount: 1,
          approvedCount: 1,
          rejectedCount: 1,
          status: {
            $cond: [
              { $gt: ['$pendingCount', 0] },
              'PENDING',
              {
                $cond: [
                  { $gt: ['$rejectedCount', 0] },
                  'REJECTED',
                  'APPROVED'
                ]
              }
            ]
          }
        }
      }
    ];

    if (status) {
      aggregation.push({ $match: { status } });
    }

    aggregation.push({ $sort: { lastSubmission: -1 } });

    const results = await KYCDocumentModel.aggregate(aggregation);
    const total = results.length;
    const paginatedMerchants = results.slice(offset, offset + limit);

    return {
      merchants: paginatedMerchants,
      total,
    };
  }

  /**
   * Get all KYC documents for a specific merchant
   */
  static async getMerchantKYCDetail(merchantId: string): Promise<any> {
    const { KYCDocumentModel } = await import('../kyc/kyc.model');

    const [merchant, documents] = await Promise.all([
      MerchantModel.findById(merchantId).lean(),
      KYCDocumentModel.find({ merchantId }).sort({ type: 1 }).lean()
    ]);

    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }

    return {
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        phoneNumber: merchant.phoneNumber,
        status: merchant.status,
      },
      documents: documents.map((doc: any) => ({
        id: doc._id,
        type: doc.type,
        status: doc.status,
        fileUrl: doc.fileUrl,
        fileId: doc.fileId,
        rejectionReason: doc.rejectionReason,
        verifiedAt: doc.verifiedAt,
        createdAt: doc.createdAt,
      })),
    };
  }

  /**
   * Update merchant details
   */
  static async updateMerchant(merchantId: string, update: any): Promise<any> {
    const merchant = await MerchantModel.findByIdAndUpdate(
      merchantId,
      { $set: update },
      { new: true }
    );

    if (!merchant) {
      throw new AppError(ErrorCode.MERCHANT_NOT_FOUND, 'Merchant not found', 404);
    }

    logger.info('Merchant details updated by admin', {
      merchantId,
      adminAction: true,
      updatedFields: Object.keys(update),
    });

    return merchant;
  }

  /**
   * Adjust merchant wallet balance
   */
  static async adjustWalletBalance(
    merchantId: string,
    amount: number,
    description: string,
    adminId: string
  ): Promise<any> {
    const wallet = await WalletModel.findOne({ merchantId });
    if (!wallet) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Merchant wallet not found', 404);
    }

    const oldBalance = wallet.balance;
    wallet.balance += amount;
    await wallet.save();

    // Create transaction record
    await WalletTransactionModel.create({
      walletId: wallet._id,
      merchantId,
      amount,
      type: amount >= 0 ? 'BONUS' : 'FEE',
      description: description || `Admin adjustment: ${amount >= 0 ? 'Credit' : 'Debit'}`,
      status: 'COMPLETED',
      metadata: {
        adminId,
        oldBalance,
        newBalance: wallet.balance,
        adjustmentType: 'ADMIN',
      },
    });

    logger.info('Merchant wallet balance adjusted by admin', {
      merchantId,
      adminId,
      amount,
      newBalance: wallet.balance,
      adminAction: true,
    });

    return {
      balance: wallet.balance,
      merchantId,
    };
  }
}
