import { Request, Response } from 'express';
import { WalletService } from './wallet.service';
import { PricingService } from './pricing.service';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError, ErrorCode } from '../../common/constants/errors';

export class WalletController {

    static getWallet = asyncHandler(async (req: Request, res: Response) => {
        const merchantId = req.user!.userId;
        const wallet = await WalletService.getWallet(merchantId);
        const history = await WalletService.getHistory(merchantId);

        res.json({
            success: true,
            wallet: {
                balance: wallet.balance,
                currency: wallet.currency
            },
            transactions: history
        });
    });

    static getPricing = asyncHandler(async (_req: Request, res: Response) => {
        res.json({
            success: true,
            tiers: PricingService.getTiers()
        });
    });

    static initiateTopUp = asyncHandler(async (req: Request, res: Response) => {
        const merchantId = req.user!.userId;
        const { amount, phone } = req.body;

        if (!amount || amount < 10) {
            throw new AppError(ErrorCode.VALIDATION_ERROR, 'Minimum top up amount is KES 10', 400);
        }

        // Initiate STK Push to our Platform Paybill
        // We treat this as a "Self Payment" from Merchant to Us.
        // We use a special reference prefix "TOPUP-"
        const reference = `TOPUP-${Date.now()}`;

        // We reuse PaymentService STK logic but targeting our OWN paybill.
        // Actually, PaymentService Logic targets the Merchant's Shortcode usually.
        // But here we want the money to come to US (Platform).
        // The current PaymentService logic supports dynamic shortcodes.
        // To route to Platform, we need a special "Platform Channel" or override.

        // Simpler approach: We Create a pending WalletTransaction 'TOPUP', 
        // and initiate STK Push using STKPushService directly targeting Config.Shortcode.

        // Ideally we should use the same payment infra to be consistent.
        // Let's create a payment request but with a flag or metadata?

        // For MVP Speed: Direct STK Push Service call.
        // But we need to track it.

        // We will use PaymentService but create a transient "Top Up" record?
        // No, let's keep Wallet Topups separate from Customer Payments to avoid polluting analytics.

        const { STKPushService } = await import('../payments/stkPush.service');
        const { darajaConfig } = await import('../../config/daraja');
        const { SystemSettingsService } = await import('../system-settings/system-settings.service');

        // 1. Create Pending Transaction
        const { WalletTransactionModel } = await import('./wallet.model');
        const wallet = await WalletService.getWallet(merchantId);

        await WalletTransactionModel.create({
            walletId: wallet.id,
            merchantId,
            amount: amount,
            type: 'TOPUP',
            reference,
            description: 'Wallet Top Up',
            status: 'PENDING'
        });

        // Determine Platform Channel
        const platformChannel = await SystemSettingsService.getPlatformChannel();
        const targetShortcode = platformChannel ? platformChannel.number : darajaConfig.shortcode;
        const targetType = platformChannel?.type === 'TILL' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline';

        // 2. Initiate STK
        const stkResponse = await STKPushService.initiate({
            phone,
            amount,
            reference,
            description: 'Paylor Credit Top Up'
        },
            targetShortcode,
            targetType
        );

        // 3. Create a Payment record for the callback to track
        // This is necessary because CallbackProcessor looks up by PaymentModel
        const { PaymentModel } = await import('../payments/payment.model');
        await PaymentModel.create({
            merchantId,
            amount,
            status: 'STK_SENT',
            provider: 'MPESA',
            providerRef: stkResponse.checkoutRequestId,
            reference,
            customerPhone: phone,
            description: 'Wallet Top Up'
        });

        res.json({
            success: true,
            message: 'Top up initiated',
            checkoutRequestId: stkResponse.checkoutRequestId,
            reference
        });
    });

    static getTopUpStatus = asyncHandler(async (req: Request, res: Response) => {
        const merchantId = req.user!.userId;
        const { reference } = req.params;

        const { WalletTransactionModel } = await import('./wallet.model');

        const transaction = await WalletTransactionModel.findOne({
            merchantId,
            reference,
            type: 'TOPUP'
        });

        if (!transaction) {
            throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, 'Transaction not found', 404);
        }

        res.json({
            success: true,
            status: transaction.status,
            amount: transaction.amount,
            reference: transaction.reference
        });
    });
}

export const walletController = WalletController;
