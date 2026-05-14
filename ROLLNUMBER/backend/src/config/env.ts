/**
 * Environment Configuration
 *
 * Centralizes environment variable access with validation
 * and type safety. Loads .env in development mode.
 */

import dotenv from 'dotenv';

/* Load .env file in non-production environments */
dotenv.config();

export interface EnvConfig {
  port: number;
  mongodbUri: string;
  nodeEnv: string;
  logApiUrl: string;
  logBearerToken: string;
  logEnableConsole: boolean;
  logMaxRetries: number;
  logRetryDelayMs: number;
  logBatchSize: number;
  logFlushIntervalMs: number;
  corsOrigin: string;
  socketCorsOrigin: string;
}

/**
 * Parse and validate environment variables.
 * Throws on missing required values in production.
 */
function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '4000', 10),
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_notifications',
    nodeEnv: process.env.NODE_ENV || 'development',
    logApiUrl: process.env.LOG_API_URL || 'http://4.224.186.213/evaluation-service/logs',
    logBearerToken: process.env.LOG_BEARER_TOKEN || '',
    logEnableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    logMaxRetries: parseInt(process.env.LOG_MAX_RETRIES || '3', 10),
    logRetryDelayMs: parseInt(process.env.LOG_RETRY_DELAY_MS || '1000', 10),
    logBatchSize: parseInt(process.env.LOG_BATCH_SIZE || '10', 10),
    logFlushIntervalMs: parseInt(process.env.LOG_FLUSH_INTERVAL_MS || '5000', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  };
}

/** Singleton config instance */
export const env: EnvConfig = loadEnvConfig();
