import { AuditLogModel, AuditLogData } from './audit.model';
import { logger } from '../../common/utils/logger';

export { AuditLogData };

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await AuditLogModel.create({
        userType: data.userType,
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });
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
    const query: any = {};

    if (filters.userType) query.userType = filters.userType;
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resourceType) query.resourceType = filters.resourceType;

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const logs = await AuditLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return logs;
  }
}
