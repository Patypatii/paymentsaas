import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { securityConfig } from './config/security';
import { errorHandler, notFoundHandler } from './common/middleware/errorHandler';
import { logger } from './common/utils/logger';
import { testConnection } from './config/database';

import { router } from './routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Adjust based on needs
  }));

  // CORS
  app.use(cors(securityConfig.cors));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check
  app.get('/health', async (_req, res) => {
    const dbConnected = await testConnection();
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });

  // API routes
  app.use(`/api/${config.apiVersion}`, router);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
