import { Router } from 'express';
import { healthController } from '../modules/public/health.controller';
import { pricingController } from '../modules/public/pricing.controller';
import { darajaCallbackController } from '../modules/callbacks/daraja.callback.controller';
import { authController } from '../modules/auth/auth.controller';
import { merchantController } from '../modules/merchants/merchant.controller';

export const publicRoutes = Router();

publicRoutes.get('/health', healthController.getHealth);
publicRoutes.get('/pricing', pricingController.getPricing);

// Authentication
publicRoutes.post('/auth/merchant/login', authController.loginMerchant);
publicRoutes.post('/auth/admin/login', authController.loginAdmin);

// Merchant Registration
publicRoutes.post('/merchants/register', merchantController.register);

// Daraja callbacks (no authentication required, but IP validation)
publicRoutes.post('/callbacks/daraja', darajaCallbackController.handleSTKCallback);
