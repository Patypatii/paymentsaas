import { WalletModel, WalletTransactionModel, IWallet } from './wallet.model';
import { MerchantModel } from '../merchants/merchant.model';
import { PricingService } from './pricing.service';
import { WhatsappService } from '../../common/services/whatsapp.service';
import { logger } from '../../common/utils/logger';

export class WalletService {
    /**
     * Get or create wallet for merchant
     */
    static async getWallet(merchantId: string): Promise<IWallet> {
        let wallet = await WalletModel.findOne({ merchantId });

        if (!wallet) {
            wallet = await WalletModel.create({
                merchantId,
                balance: 0,
                currency: 'KES'
            });
        }

        return wallet;
    }

    /**
     * Check if wallet has sufficient funds for a transaction amount
     */
    static async hasSufficientFunds(merchantId: string, transactionAmount: number): Promise<{ allowed: boolean; fee: number; balance: number }> {
        const wallet = await this.getWallet(merchantId);
        const fee = PricingService.calculateFee(transactionAmount);

        if (wallet.balance < fee) {
            return { allowed: false, fee, balance: wallet.balance };
        }

        return { allowed: true, fee, balance: wallet.balance };
    }

    /**
     * Deduct fee from wallet
     */
    static async deductFee(merchantId: string, transactionAmount: number, reference: string): Promise<void> {
        const fee = PricingService.calculateFee(transactionAmount);
        if (fee <= 0) return;

        const wallet = await this.getWallet(merchantId);

        // We allow going slightly negative on deduction if they had enough at initiation?
        // Or strictly enforce. For now, strict.

        // Use atomic update
        const updated = await WalletModel.findOneAndUpdate(
            { merchantId, balance: { $gte: fee } }, // Optimistic locking equivalent
            { $inc: { balance: -fee } },
            { new: true }
        );

        if (!updated) {
            // This happens if balance dropped between check and deduction (race condition)
            // Or if balance is insufficient.
            // We log it as a debt or failed deduction?
            // Ideally we shouldn't fail a SUCCESSFUL customer payment just because merchant owes us 5 bob.
            // So we force the deduction even if it goes negative.

            await WalletModel.updateOne(
                { merchantId },
                { $inc: { balance: -fee } }
            );
        }

        // Record transaction
        await WalletTransactionModel.create({
            walletId: wallet.id,
            merchantId,
            amount: -fee,
            type: 'FEE',
            reference,
            description: `Transaction Fee for ${reference}`,
            status: 'COMPLETED'
        });

        // Check for Low Balance Alert
        try {
            const currentWallet = await WalletModel.findById(wallet.id);
            if (!currentWallet) return;

            const merchant = await MerchantModel.findById(merchantId);
            if (merchant && merchant.notifications?.lowBalanceAlert) {
                const threshold = merchant.notifications.lowBalanceThreshold || 50;
                
                // Only alert if we just crossed the threshold to avoid spamming
                // We know previous balance was wallet.balance, and new is currentWallet.balance
                if (wallet.balance >= threshold && currentWallet.balance < threshold) {
                    const alertPhone = merchant.notifications.alertPhone || merchant.phoneNumber;
                    
                    if (alertPhone) {
                        const message = `⚠️ *Paylor Low Balance Alert*\n\nYour credit balance has dropped below your threshold of ${wallet.currency} ${threshold.toFixed(2)}.\n\nCurrent Balance: *${wallet.currency} ${currentWallet.balance.toFixed(2)}*\n\nPlease top up to ensure uninterrupted service.`;
                        
                        await WhatsappService.sendMessage(alertPhone, message);
                        logger.info(`Low balance alert sent to merchant ${merchantId} at ${alertPhone}`);
                    }
                }
            }
        } catch (error: any) {
            logger.error('Failed to process low balance alert', { error: error.message, merchantId });
        }
    }

    /**
     * Update wallet balance ONLY
     */
    static async updateBalance(merchantId: string, amount: number): Promise<IWallet> {
        const wallet = await this.getWallet(merchantId);

        const updated = await WalletModel.findOneAndUpdate(
            { _id: wallet.id },
            { $inc: { balance: amount } },
            { new: true }
        );

        if (!updated) {
            throw new Error('Failed to update wallet balance');
        }

        return updated;
    }

    /**
     * Top up wallet (Credit)
     */
    static async creditWallet(merchantId: string, amount: number, reference: string, description: string): Promise<void> {
        const wallet = await this.getWallet(merchantId);

        await this.updateBalance(merchantId, amount);

        await WalletTransactionModel.create({
            walletId: wallet.id,
            merchantId,
            amount: amount,
            type: 'TOPUP',
            reference,
            description,
            status: 'COMPLETED'
        });
    }

    /**
     * List wallet transactions
     */
    static async getHistory(merchantId: string, limit = 20): Promise<any[]> {
        return WalletTransactionModel.find({ merchantId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}
