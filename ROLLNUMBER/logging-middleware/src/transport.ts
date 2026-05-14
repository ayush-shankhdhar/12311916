/**
 * Logging Middleware - HTTP Transport
 *
 * Axios-based HTTP wrapper with exponential backoff retry strategy.
 * Handles sending log payloads to the evaluation service API.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { LogPayload } from './types';
import { getLoggerConfig } from './config';

/** Singleton axios instance */
let httpClient: AxiosInstance | null = null;

/**
 * Get or create the configured Axios instance.
 * Uses lazy initialization to allow config setup before first use.
 */
function getHttpClient(): AxiosInstance {
  if (!httpClient) {
    const config = getLoggerConfig();
    httpClient = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.bearerToken}`,
      },
    });
  }
  return httpClient;
}

/**
 * Reset the HTTP client (useful when config changes).
 */
export function resetHttpClient(): void {
  httpClient = null;
}

/**
 * Sleep utility for retry delays.
 *
 * @param ms - Milliseconds to wait
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send a log payload to the remote API with retry logic.
 * Uses exponential backoff: delay * 2^attempt.
 *
 * @param payload - The log entry to send
 * @returns True if sent successfully, false otherwise
 */
export async function sendLog(payload: LogPayload): Promise<boolean> {
  const config = getLoggerConfig();
  const client = getHttpClient();

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      await client.post('', payload);
      return true;
    } catch (error: unknown) {
      const isLastAttempt = attempt === config.maxRetries;
      const axiosErr = error as AxiosError;

      if (isLastAttempt) {
        /* Error-safe: silently fail rather than crashing the app */
        if (config.enableConsole) {
          const errMsg = `[logging-middleware] Failed to send log after ${config.maxRetries + 1} attempts: ${axiosErr.message}\n`;
          if (typeof (globalThis as any).window === 'undefined' && typeof process !== 'undefined' && process.stderr) {
            process.stderr.write(errMsg);
          } else {
            console.warn(errMsg.trim());
          }
        }
        return false;
      }

      /* Exponential backoff */
      const delay = config.retryDelayMs * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  return false;
}

/**
 * Send a batch of log payloads.
 *
 * @param payloads - Array of log entries to send
 * @returns Array of results indicating success/failure per entry
 */
export async function sendLogBatch(payloads: LogPayload[]): Promise<boolean[]> {
  const results = await Promise.allSettled(
    payloads.map((payload) => sendLog(payload))
  );

  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : false
  );
}
