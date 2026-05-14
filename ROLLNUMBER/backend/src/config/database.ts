/**
 * Database Configuration
 *
 * Manages MongoDB connection lifecycle using Mongoose.
 * Includes connection retry logic and event logging.
 */

import mongoose from 'mongoose';
import { createLogger } from 'logging-middleware';
import { env } from './env';

const logger = createLogger('backend', 'db');

/**
 * Establish connection to MongoDB with retry logic.
 * Logs connection success/failure events.
 */
export async function connectDatabase(): Promise<void> {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Attempting MongoDB connection (attempt ${attempt}/${MAX_RETRIES})...`);

      await mongoose.connect(env.mongodbUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('MongoDB connected successfully');

      /* Connection event handlers */
      mongoose.connection.on('error', (error: Error) => {
        logger.error(`MongoDB connection error: ${error.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${errMsg}`);

      if (attempt === MAX_RETRIES) {
        logger.fatal(`Unable to connect to MongoDB after ${MAX_RETRIES} attempts. Exiting.`);
        throw new Error(`Database connection failed: ${errMsg}`);
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

/**
 * Gracefully close the MongoDB connection.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error disconnecting MongoDB: ${errMsg}`);
  }
}
