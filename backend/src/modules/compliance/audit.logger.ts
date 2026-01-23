import { pool } from '../../config/database';
import { logger } from '../../common/utils/logger';

export interface AuditLogData {
  userType: 'MERCHANT' | 'ADMIN';
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs 
         (user_type, user_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.userType,
          data.userId || null,
          data.action,
          data.resourceType || null,
          data.resourceId || null,
          data.details ? JSON.stringify(data.details) : null,
          data.ipAddress || null,
          data.userAgent || null,
        ]
      );
    } catch (error: any) {
      // Don't throw - audit logging shouldn't break the application
      logger.error('Failed to log audit event', {
        error: error.message,
        data,
      });
    }
  }

  /**
   * Query audit logs
   */
  static async query(filters: {
    userType?: string;
    userId?: string;
    action?: string;
    resourceType?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters.userType) {
      conditions.push(`user_type = $${paramCount++}`);
      params.push(filters.userType);
    }
    if (filters.userId) {
      conditions.push(`user_id = $${paramCount++}`);
      params.push(filters.userId);
    }
    if (filters.action) {
      conditions.push(`action = $${paramCount++}`);
      params.push(filters.action);
    }
    if (filters.resourceType) {
      conditions.push(`resource_type = $${paramCount++}`);
      params.push(filters.resourceType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const result = await pool.query(
      `SELECT * FROM audit_logs 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      [...params, limit, offset]
    );

    return result.rows;
  }
}
