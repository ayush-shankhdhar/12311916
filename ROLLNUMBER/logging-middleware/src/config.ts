/**
 * Logging Middleware - Configuration
 *
 * Centralized configuration management for the logger.
 * Reads from environment variables with sensible defaults.
 */

import { LoggerConfig } from './types';

/** Default configuration values */
const DEFAULT_CONFIG: Required<LoggerConfig> = {
  apiUrl: 'http://4.224.186.213/evaluation-service/logs',
  bearerToken: '',
  maxRetries: 3,
  retryDelayMs: 1000,
  enableConsole: false,
  batchSize: 10,
  flushIntervalMs: 5000,
};

/** Singleton config instance */
let currentConfig: Required<LoggerConfig> = { ...DEFAULT_CONFIG };

/**
 * Initialize logger configuration.
 * Must be called once at app startup before any logging.
 *
 * @param config - Partial configuration to merge with defaults
 */
export function initLoggerConfig(config: Partial<LoggerConfig>): void {
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries,
    retryDelayMs: config.retryDelayMs ?? DEFAULT_CONFIG.retryDelayMs,
    enableConsole: config.enableConsole ?? DEFAULT_CONFIG.enableConsole,
    batchSize: config.batchSize ?? DEFAULT_CONFIG.batchSize,
    flushIntervalMs: config.flushIntervalMs ?? DEFAULT_CONFIG.flushIntervalMs,
  };
}

/**
 * Retrieve the current logger configuration.
 *
 * @returns The current resolved configuration
 */
export function getLoggerConfig(): Readonly<Required<LoggerConfig>> {
  return currentConfig;
}
