import { Router } from 'express';
import { healthController } from '../modules/public/health.controller';
import { pricingController } from '../modules/public/pricing.controller';
import { darajaCallbackController } from '../modules/callbacks/daraja.callback.controller';
import { authController } from '../modules/auth/auth.controller';
import { merchantController } from '../modules/merchants/merchant.controller';
import { contactController } from '../modules/public/contact.controller';

export const publicRoutes = Router();

publicRoutes.get('/health', healthController.getHealth);
publicRoutes.get('/pricing', pricingController.getPricing);

// Authentication
publicRoutes.post('/auth/merchant/login', authController.loginMerchant);
publicRoutes.post('/auth/admin/login', authController.loginAdmin);
publicRoutes.post('/auth/merchant/forgot-password', authController.forgotPassword);
publicRoutes.post('/auth/merchant/reset-password', authController.resetPassword);

// Merchant Registration
publicRoutes.post('/merchants/register', merchantController.register);

// Contact Form
publicRoutes.post('/contact', contactController.submitContact);

// Daraja callbacks (no authentication required, but IP validation)
publicRoutes.post('/callbacks/daraja', darajaCallbackController.handleSTKCallback);
