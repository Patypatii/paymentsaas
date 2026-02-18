import { Router } from 'express';
import { adminController } from '../modules/admin/admin.controller';
import { adminGuard } from '../modules/admin/admin.guard';
import { systemSettingsController } from '../modules/system-settings/system-settings.controller';

export const adminRoutes = Router();

// All admin routes require authentication
adminRoutes.use(adminGuard);

// System stats
adminRoutes.get('/stats', adminController.getSystemStats);

// Merchant management
adminRoutes.get('/merchants', adminController.listMerchants);
adminRoutes.get('/merchants/:merchantId', adminController.getMerchant);
adminRoutes.put('/merchants/:merchantId', adminController.updateMerchant);
adminRoutes.post('/merchants/:merchantId/approve', adminController.approveMerchant);
adminRoutes.post('/merchants/:merchantId/suspend', adminController.suspendMerchant);
adminRoutes.post('/merchants/:merchantId/reject', adminController.rejectMerchant);
adminRoutes.post('/merchants/:merchantId/wallet/adjust', adminController.adjustWalletBalance);

// Transactions
adminRoutes.get('/transactions', adminController.getAllTransactions);

// Audit logs
adminRoutes.get('/audit-logs', adminController.getAuditLogs);

// System health
adminRoutes.get('/health', adminController.getSystemHealth);

// KYC Management
adminRoutes.get('/kyc', adminController.getAllKYCSubmissions);
adminRoutes.get('/kyc/merchants', adminController.getKYCMerchants);
adminRoutes.get('/kyc/merchants/:merchantId', adminController.getMerchantKYCDetail);
adminRoutes.get('/kyc/:kycId', adminController.getKYCSubmission);
adminRoutes.post('/kyc/:kycId/approve', adminController.approveKYCDocument);
adminRoutes.post('/kyc/:kycId/reject', adminController.rejectKYCDocument);

// System Settings
adminRoutes.get('/settings/channel', systemSettingsController.getPlatformChannel);
adminRoutes.post('/settings/channel', systemSettingsController.updatePlatformChannel);
