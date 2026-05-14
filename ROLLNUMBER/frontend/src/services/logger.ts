import { initLoggerConfig, Log, createLogger } from 'logging-middleware';

/* Default mock configuration for evaluations */
const LOG_API_URL = 'http://4.224.186.213/evaluation-service/logs';
const LOG_BEARER_TOKEN = 'student_bearer_token';

/**
 * Ensures frontend logging config is initialized just once.
 */
let isInitialized = false;

export function getAppLogger() {
  if (typeof window !== 'undefined' && !isInitialized) {
    initLoggerConfig({
      apiUrl: LOG_API_URL,
      bearerToken: LOG_BEARER_TOKEN,
      enableConsole: true, /* Keep browser logging transparent in console */
      maxRetries: 2,
      batchSize: 5,
      flushIntervalMs: 5000,
    });
    isInitialized = true;
  }
  
  return createLogger('frontend', 'api');
}

/**
 * Hook-friendly generic dispatcher
 */
export function clientLog(level: 'debug' | 'info' | 'warn' | 'error' | 'fatal', packageName: any, message: string) {
  if (typeof window !== 'undefined') {
    if (!isInitialized) getAppLogger();
    Log('frontend', level, packageName, message);
  }
}
