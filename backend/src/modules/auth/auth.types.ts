export interface JWTPayload {
  userId: string;
  email: string;
  type: 'merchant' | 'admin';
  role?: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  merchantId?: string;
}
