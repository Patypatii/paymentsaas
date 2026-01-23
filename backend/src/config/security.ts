import { config } from './env';

export const securityConfig = {
  // CORS configuration
  cors: {
    origin: config.nodeEnv === 'production' 
      ? process.env.CORS_ORIGIN?.split(',') || []
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.maxRequests,
  },
  
  // API key settings
  apiKey: {
    length: 32,
    prefix: 'pk_',
  },
  
  // HMAC settings
  hmac: {
    algorithm: 'sha256',
    timestampTolerance: 5 * 60 * 1000, // 5 minutes
  },
};
