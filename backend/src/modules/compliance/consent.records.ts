import { logger } from '../../common/utils/logger';
import mongoose from 'mongoose';
import { ConsentRecordModel } from './consent.model';

export interface ConsentData {
  merchantId: string;
  customerPhone: string;
  consentType: string;
  metadata?: any;
  granted?: boolean;
}

export class ConsentRecords {
  /**
   * Record merchant consent
   */
  static async recordConsent(data: ConsentData): Promise<void> {
    try {
      await ConsentRecordModel.create({
        merchantId: new mongoose.Types.ObjectId(data.merchantId),
        customerPhone: data.customerPhone,
        consentType: data.consentType,
        metadata: data.metadata,
      });
    } catch (error: any) {
      logger.error('Failed to record consent', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Check if customer has granted consent
   */
  static async checkConsent(phone: string, type: string): Promise<boolean> {
    const record = await ConsentRecordModel.findOne({
      customerPhone: phone,
      consentType: type,
    }).sort({ createdAt: -1 });

    return record ? record.granted : false;
  }
}
