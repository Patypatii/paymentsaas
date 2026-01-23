import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AppError, ErrorCode } from '../../common/constants/errors';

export const adminController = {
  async listMerchants(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const status = req.query.status as string | undefined;

    const result = await AdminService.listMerchants(limit, offset, status);
    res.json(result);
  },

  async getMerchant(req: Request, res: Response): Promise<void> {
    const { merchantId } = req.params;
    const result = await AdminService.getMerchant(merchantId);
    res.json(result);
  },

  async approveMerchant(req: Request, res: Response): Promise<void> {
    const { merchantId } = req.params;
    const result = await AdminService.approveMerchant(merchantId);
    res.json(result);
  },

  async suspendMerchant(req: Request, res: Response): Promise<void> {
    const { merchantId } = req.params;
    const { reason } = req.body;
    await AdminService.suspendMerchant(merchantId, reason);
    res.json({ message: 'Merchant suspended successfully' });
  },

  async rejectMerchant(req: Request, res: Response): Promise<void> {
    const { merchantId } = req.params;
    const { reason } = req.body;
    await AdminService.rejectMerchant(merchantId, reason);
    res.json({ message: 'Merchant rejected successfully' });
  },

  async getSystemStats(req: Request, res: Response): Promise<void> {
    const stats = await AdminService.getSystemStats();
    res.json(stats);
  },

  async getAllTransactions(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const result = await AdminService.getAllTransactions(limit, offset);
    res.json(result);
  },

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const result = await AdminService.getAuditLogs(limit, offset);
    res.json(result);
  },

  async getSystemHealth(req: Request, res: Response): Promise<void> {
    const health = await AdminService.getSystemHealth();
    res.json(health);
  },

  async getAllKYCSubmissions(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const status = req.query.status as string | undefined;
    const result = await AdminService.getAllKYCSubmissions(limit, offset, status);
    res.json(result);
  },

  async getKYCSubmission(req: Request, res: Response): Promise<void> {
    const { kycId } = req.params;
    const submission = await AdminService.getKYCSubmission(kycId);
    res.json(submission);
  },

  async approveKYCDocument(req: Request, res: Response): Promise<void> {
    const { kycId } = req.params;
    const adminId = req.user?.userId;
    if (!adminId) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }
    await AdminService.approveKYCDocument(kycId, adminId);
    res.json({ message: 'KYC document approved successfully' });
  },

  async rejectKYCDocument(req: Request, res: Response): Promise<void> {
    const { kycId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.userId;
    if (!adminId) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }
    if (!reason) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }
    await AdminService.rejectKYCDocument(kycId, adminId, reason);
    res.json({ message: 'KYC document rejected successfully' });
  },

  async getKYCMerchants(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const status = req.query.status as string | undefined;
    const result = await AdminService.getKYCMerchants(limit, offset, status);
    res.json(result);
  },

  async getMerchantKYCDetail(req: Request, res: Response): Promise<void> {
    const { merchantId } = req.params;
    const result = await AdminService.getMerchantKYCDetail(merchantId);
    res.json(result);
  },
};
