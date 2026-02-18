import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  apiVersion: string;
  database: {
    uri: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  api: {
    keySecret: string;
    hmacSecret: string;
  };
  daraja: {
    consumerKey: string;
    consumerSecret: string;
    baseUrl: string;
    shortcode: string;
    passkey: string;
    callbackUrl: string;
  };
  webhook: {
    retryAttempts: number;
    retryDelayMs: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
  };
  admin: {
    email: string;
    password: string;
  };
  imagekit: {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

export const config: EnvConfig = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 5000),
  apiVersion: getEnvVar('API_VERSION', 'v1'),
  database: {
    uri: getEnvVar('MONGODB_URI', 'mongodb+srv://paylor:paylor123@cluster0.rufsm1d.mongodb.net/paylor?retryWrites=true&w=majority'),
  },
  redis: {
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: process.env['REDIS_PASSWORD'],
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  },
  api: {
    keySecret: getEnvVar('API_KEY_SECRET'),
    hmacSecret: getEnvVar('HMAC_SECRET'),
  },
  daraja: {
    consumerKey: getEnvVar('DARAJA_CONSUMER_KEY'),
    consumerSecret: getEnvVar('DARAJA_CONSUMER_SECRET'),
    baseUrl: getEnvVar('DARAJA_BASE_URL', 'https://sandbox.safaricom.co.ke'),
    shortcode: getEnvVar('DARAJA_SHORTCODE', ''),
    passkey: getEnvVar('DARAJA_PASSKEY'),
    callbackUrl: getEnvVar('DARAJA_CALLBACK_URL'),
  },
  webhook: {
    retryAttempts: getEnvNumber('WEBHOOK_RETRY_ATTEMPTS', 3),
    retryDelayMs: getEnvNumber('WEBHOOK_RETRY_DELAY_MS', 1000),
  },
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 60000),
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
  },
  admin: {
    email: getEnvVar('ADMIN_EMAIL', 'admin@yourplatform.com'),
    password: getEnvVar('ADMIN_PASSWORD', 'change-this-password'),
  },
  imagekit: {
    publicKey: getEnvVar('IMAGEKIT_PUBLIC_KEY'),
    privateKey: getEnvVar('IMAGEKIT_PRIVATE_KEY'),
    urlEndpoint: getEnvVar('IMAGEKIT_URL_ENDPOINT'),
  },
};
