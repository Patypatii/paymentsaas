export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface STKPushRequest {
  phone: string;
  amount: number;
  reference: string;
  description: string;
  channelId?: string;
}

export interface STKPushResponse {
  transactionId: string;
  checkoutRequestId: string;
  status: PaymentStatus;
}

export interface DarajaSTKResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}
