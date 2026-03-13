import { connectDatabase } from './src/config/database';
import { MerchantModel } from './src/modules/merchants/merchant.model';
import { WalletService } from './src/modules/wallet/wallet.service';
import { WhatsappService } from './src/common/services/whatsapp.service';
import mongoose from 'mongoose';

async function run() {
  try {
    await connectDatabase();
    
    // Find the merchant patypatii
    const merchant = await MerchantModel.findOne({ username: 'patypatii' });
    if (!merchant) {
      console.log('Merchant not found.');
      return;
    }

    // Get their wallet balance
    const wallet = await WalletService.getWallet(merchant.id);
    
    // Get their phone number
    const phone = merchant.notifications?.alertPhone || merchant.phoneNumber;
    if (!phone) {
      console.log('No phone number found for merchant.');
      return;
    }

    const threshold = merchant.notifications?.lowBalanceThreshold || 50;
    const message = `⚠️ *Paylor Low Balance Alert*\n\nYour credit balance has dropped below your threshold of ${wallet.currency} ${threshold.toFixed(2)}.\n\nCurrent Balance: *${wallet.currency} ${wallet.balance.toFixed(2)}*\n\nPlease top up to ensure uninterrupted service.`;
    
    console.log(`Sending message to ${phone}...`);
    
    const success = await WhatsappService.sendMessage(phone, message);
    
    if (success) {
      console.log('Message sent successfully.');
    } else {
      console.log('Failed to send message.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
