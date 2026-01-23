import { pool } from '../../config/database';
import { logger } from '../../common/utils/logger';

export interface ConsentData {
  merchantId: string;
  consentType: string;
  consentText: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class ConsentRecords {
  /**
   * Record merchant consent
   */
  static async recordConsent(data: ConsentData): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO consent_records 
         (merchant_id, consent_type, consent_text, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.merchantId,
          data.consentType,
          data.consentText,
          data.ipAddress || null,
          data.userAgent || null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );
    } catch (error: any) {
      logger.error('Failed to record consent', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Check if merchant has given consent
   */
  static async hasConsent(merchantId: string, consentType: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM consent_records
       WHERE merchant_id = $1 AND consent_type = $2`,
      [merchantId, consentType]
    );

    return parseInt(result.rows[0].count, 10) > 0;
  }
}
