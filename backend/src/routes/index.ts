import { Router } from 'express';
import { publicRoutes } from './public.routes';
import { merchantRoutes } from './merchant.routes';
import { adminRoutes } from './admin.routes';

export const router = Router();

router.use('/public', publicRoutes);
router.use('/merchants', merchantRoutes);
router.use('/admin', adminRoutes);
