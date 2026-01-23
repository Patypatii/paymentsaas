import { createApp } from './app';
import { config } from './config/env';
import { logger } from './common/utils/logger';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Test Redis connection
    try {
      await getRedisClient();
      logger.info('Redis connection successful');
    } catch (error) {
      logger.warn('Redis connection failed. Rate limiting may not work properly.', error);
    }

    // Create and start Express app
    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        environment: config.nodeEnv,
        apiVersion: config.apiVersion,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
