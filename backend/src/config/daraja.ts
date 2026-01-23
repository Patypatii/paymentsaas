import { config } from './env';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../common/utils/logger';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

export interface DarajaConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
}

export const darajaConfig: DarajaConfig = {
  consumerKey: config.daraja.consumerKey,
  consumerSecret: config.daraja.consumerSecret,
  baseUrl: config.daraja.baseUrl,
  shortcode: config.daraja.shortcode || '',
  passkey: config.daraja.passkey,
  callbackUrl: config.daraja.callbackUrl,
};

const darajaClient: AxiosInstance = axios.create({
  baseURL: darajaConfig.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getDarajaAccessToken(): Promise<string> {
  const now = Date.now();

  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  try {
    const auth = Buffer.from(
      `${darajaConfig.consumerKey}:${darajaConfig.consumerSecret}`
    ).toString('base64');

    const response = await darajaClient.post(
      '/oauth/v1/generate?grant_type=client_credentials',
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;
    tokenExpiry = now + (expiresIn - 60) * 1000; // Refresh 60s before expiry

    logger.info('Daraja access token obtained');
    return accessToken;
  } catch (error: any) {
    logger.error('Failed to get Daraja access token', {
      error: error.message,
      response: error.response?.data,
    });
    throw new Error('Failed to authenticate with Daraja API');
  }
}

export function getDarajaClient(): AxiosInstance {
  return darajaClient;
}
