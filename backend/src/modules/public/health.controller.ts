import { Request, Response } from 'express';
import { testConnection } from '../../config/database';
import { getRedisClient } from '../../config/redis';

export const healthController = {
  async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const dbConnected = await testConnection();
      let redisConnected = false;

      try {
        const redis = await getRedisClient();
        redisConnected = redis.isOpen;
      } catch {
        redisConnected = false;
      }

      const status = dbConnected && redisConnected ? 'healthy' : 'degraded';
      const statusCode = dbConnected ? 200 : 503;

      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        services: {
          database: dbConnected ? 'connected' : 'disconnected',
          redis: redisConnected ? 'connected' : 'disconnected',
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  },
};
