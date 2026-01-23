import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../common/utils/logger';

export async function connectDatabase(): Promise<void> {
  try {
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 15000, // Timeout after 15s (increased from 5s for stability)
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      autoIndex: true,
      maxPoolSize: 10,
    };

    // Connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose: Connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose: Connection error', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose: Connection lost');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose: Connection restored');
    });

    await mongoose.connect(config.database.uri, options);
    logger.info('Database connection initial success');
  } catch (error) {
    logger.error('Database connection failed to initialize', error);
    process.exit(1);
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    return mongoose.connection.readyState === 1;
  } catch (error) {
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Database connection closed');
}
