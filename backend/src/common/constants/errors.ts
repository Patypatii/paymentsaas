export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  EXPIRED_TIMESTAMP = 'EXPIRED_TIMESTAMP',

  // Merchant errors
  MERCHANT_NOT_FOUND = 'MERCHANT_NOT_FOUND',
  MERCHANT_INACTIVE = 'MERCHANT_INACTIVE',
  MERCHANT_SUSPENDED = 'MERCHANT_SUSPENDED',

  // Payment errors
  INVALID_PAYMENT_REQUEST = 'INVALID_PAYMENT_REQUEST',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  DARAJA_ERROR = 'DARAJA_ERROR',

  // Webhook errors
  WEBHOOK_DELIVERY_FAILED = 'WEBHOOK_DELIVERY_FAILED',
  INVALID_WEBHOOK_URL = 'INVALID_WEBHOOK_URL',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_AMOUNT = 'INVALID_AMOUNT',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.INVALID_API_KEY]: 'Invalid API key',
  [ErrorCode.INVALID_SIGNATURE]: 'Invalid request signature',
  [ErrorCode.EXPIRED_TIMESTAMP]: 'Request timestamp expired',
  [ErrorCode.MERCHANT_NOT_FOUND]: 'Merchant not found',
  [ErrorCode.MERCHANT_INACTIVE]: 'Merchant account is inactive',
  [ErrorCode.MERCHANT_SUSPENDED]: 'Merchant account is suspended',
  [ErrorCode.INVALID_PAYMENT_REQUEST]: 'Invalid payment request',
  [ErrorCode.PAYMENT_FAILED]: 'Payment processing failed',
  [ErrorCode.QUOTA_EXCEEDED]: 'Usage quota exceeded',
  [ErrorCode.DARAJA_ERROR]: 'Daraja API error',
  [ErrorCode.WEBHOOK_DELIVERY_FAILED]: 'Webhook delivery failed',
  [ErrorCode.INVALID_WEBHOOK_URL]: 'Invalid webhook URL',
  [ErrorCode.VALIDATION_ERROR]: 'Validation error',
  [ErrorCode.INVALID_PHONE_NUMBER]: 'Invalid phone number format',
  [ErrorCode.INVALID_AMOUNT]: 'Invalid amount',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'Requested resource not found',
};
