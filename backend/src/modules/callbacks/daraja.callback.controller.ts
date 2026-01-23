import { Request, Response } from 'express';
import { CallbackProcessor } from './callback.processor';
import { validateCallbackIP, validateCallbackPayload } from './callback.validator';
import { logger } from '../../common/utils/logger';

export const darajaCallbackController = {
  async handleSTKCallback(req: Request, res: Response): Promise<void> {
    try {
      // Validate IP (in production)
      const clientIP = req.ip || req.socket.remoteAddress || '';
      if (!validateCallbackIP(clientIP)) {
        logger.warn('Callback from unauthorized IP', { ip: clientIP });
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      // Validate payload
      if (!validateCallbackPayload(req.body)) {
        logger.warn('Invalid callback payload', { body: req.body });
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }

      // Process callback asynchronously
      CallbackProcessor.processSTKCallback(req.body).catch((error) => {
        logger.error('Async callback processing failed', error);
      });

      // Respond immediately to Daraja
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received',
      });
    } catch (error: any) {
      logger.error('Callback handling failed', error);
      res.status(500).json({
        ResultCode: 1,
        ResultDesc: 'Callback processing failed',
      });
    }
  },
};
