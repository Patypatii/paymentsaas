import { Router } from 'express';
import { merchantController } from '../modules/merchants/merchant.controller';
import { paymentController } from '../modules/payments/payment.controller';
import { apiKeyController } from '../modules/api-keys/apiKey.controller';
import { subscriptionController } from '../modules/subscriptions/subscription.controller';
import { walletController } from '../modules/wallet/wallet.controller';
import { kycController } from '../modules/kyc/kyc.controller';
import { channelController } from '../modules/channels/channel.controller';
import { webhookController } from '../modules/webhooks/webhook.controller';
import { jwtGuard } from '../modules/auth/jwt.guard';
import { flexibleAuth } from '../modules/auth/flexibleAuth.guard';
import { createRateLimiter } from '../common/middleware/rateLimiter';

export const merchantRoutes = Router();

// Public merchant registration
merchantRoutes.post('/register', merchantController.register);

// Shared Payment routes (Support both Session JWT and API Key)
// Fixed: Moved above global jwtGuard so API keys can bypass it
const paymentRoutes = Router();
paymentRoutes.use(flexibleAuth);
paymentRoutes.use(createRateLimiter({ maxRequests: 60 })); // 60 requests per minute

paymentRoutes.post('/stk-push', paymentController.initiateSTKPush);
paymentRoutes.get('/transactions', paymentController.listTransactions);
paymentRoutes.get('/transactions/:transactionId', paymentController.getTransaction);

merchantRoutes.use('/payments', paymentRoutes);

// Dashboard-only routes (Require JWT Session)
merchantRoutes.use(jwtGuard);

// Wallet Management
merchantRoutes.get('/wallet', walletController.getWallet);
merchantRoutes.post('/wallet/topup', walletController.initiateTopUp);
merchantRoutes.get('/wallet/topup/:reference', walletController.getTopUpStatus);
merchantRoutes.get('/pricing', walletController.getPricing);

merchantRoutes.get('/profile', merchantController.getProfile);
merchantRoutes.patch('/profile', merchantController.updateProfile);
merchantRoutes.patch('/profile/avatar', merchantController.updateProfilePicture);
merchantRoutes.patch('/profile/bio', merchantController.updateBio);
merchantRoutes.get('/payments/stats', paymentController.getDashboardStats);
// merchantRoutes.get('/payments/transactions', paymentController.listTransactions); // Already in shared paymentRoutes

// API key management
merchantRoutes.get('/api-keys', apiKeyController.listKeys);
merchantRoutes.post('/api-keys', apiKeyController.createKey);
merchantRoutes.delete('/api-keys/:keyId', apiKeyController.revokeKey);
merchantRoutes.delete('/api-keys/:keyId/permanent', apiKeyController.deleteKey);

// Subscription management
merchantRoutes.get('/subscription', subscriptionController.getSubscription);
merchantRoutes.post('/subscription', subscriptionController.createSubscription);
merchantRoutes.delete('/subscription', subscriptionController.cancelSubscription);

// Channel management
merchantRoutes.get('/channels/sync-aliases', channelController.syncAliases);
merchantRoutes.get('/channels', channelController.listChannels);
merchantRoutes.post('/channels', channelController.createChannel);
merchantRoutes.patch('/channels/:channelId', channelController.updateChannel);
merchantRoutes.delete('/channels/:channelId', channelController.deleteChannel);

// Webhook management
merchantRoutes.get('/webhooks', webhookController.listWebhooks);
merchantRoutes.post('/webhooks', webhookController.createWebhook);
merchantRoutes.delete('/webhooks/:webhookId', webhookController.deleteWebhook);

// KYC management
merchantRoutes.get('/kyc/auth', kycController.getAuthParams);
merchantRoutes.get('/kyc', kycController.getDocuments);
merchantRoutes.post('/kyc', kycController.submitDocument);
merchantRoutes.post('/kyc/finalize', kycController.finalizeKyc);

/* cspell:ignore topup */
