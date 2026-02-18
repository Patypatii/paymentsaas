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
  maxRedirects: 0, // Disable redirects to catch 301/302 issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Paylor/1.0', // Set custom User-Agent to avoid blocking
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

    const response = await darajaClient.get(
      '/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    // DEBUG: Log the full response from Safaricom
    logger.info('Daraja OAuth Response:', {
      status: response.status,
      data: response.data
    });

    const token = response.data.access_token;
    if (!token) {
      throw new Error('No access token received from Daraja');
    }

    accessToken = token;
    const expiresIn = response.data.expires_in || 3600;
    tokenExpiry = now + (parseInt(expiresIn, 10) - 60) * 1000; // Refresh 60s before expiry

    logger.info('Daraja access token obtained');
    return accessToken as string;
  } catch (error: any) {
    logger.error('Failed to get Daraja access token', {
      error: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error('Failed to authenticate with Daraja API');
  }
}

export function getDarajaClient(): AxiosInstance {
  return darajaClient;
}
