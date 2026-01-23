import { AppError, ErrorCode } from '../../common/constants/errors';
import { logger } from '../../common/utils/logger';

// Safaricom IP ranges (these should be validated in production)
const SAFARICOM_IPS = [
  '196.201.214.0/24',
  '196.201.215.0/24',
  // Add more IP ranges as needed
];

export function validateCallbackIP(ip: string): boolean {
  // In production, implement proper IP range checking
  // For now, we'll allow all IPs in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // TODO: Implement proper IP range validation
  logger.warn('IP validation not fully implemented', { ip });
  return true;
}

export function validateCallbackPayload(payload: any): boolean {
  // Validate required fields from Daraja callback
  if (!payload.Body || !payload.Body.stkCallback) {
    return false;
  }

  const callback = payload.Body.stkCallback;
  if (!callback.CheckoutRequestID || !callback.ResultCode) {
    return false;
  }

  return true;
}
