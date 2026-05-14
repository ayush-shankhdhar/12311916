/**
 * Logger Initialization
 *
 * Configures the shared logging-middleware with variables from the environment.
 */

import { initLoggerConfig } from 'logging-middleware';
import { env } from './env';

export function initAppLogger(): void {
  initLoggerConfig({
    apiUrl: env.logApiUrl,
    bearerToken: env.logBearerToken,
    enableConsole: env.logEnableConsole,
    maxRetries: env.logMaxRetries,
    retryDelayMs: env.logRetryDelayMs,
    batchSize: env.logBatchSize,
    flushIntervalMs: env.logFlushIntervalMs,
  });
}
