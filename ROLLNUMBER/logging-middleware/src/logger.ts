import {
  LogStack,
  LogLevel,
  LogPackage,
  LogPayload,
} from './types';
import { getLoggerConfig } from './config';
import { sendLog, sendLogBatch } from './transport';

// In-memory array for storing batch logs before dispatch
let logBuffer: LogPayload[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

// Main Log dispatch handler
export function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): void {
  const payload: LogPayload = {
    stack,
    level,
    packageName,
    message,
    timestamp: new Date().toISOString(),
  };

  const config = getLoggerConfig();

  /* Console output for local development - safe for Browser + Node environments */
  if (config.enableConsole) {
    const prefix = `[${payload.timestamp}] [${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}]`;
    const outStr = `${prefix} ${message}\n`;
    if (typeof (globalThis as any).window === 'undefined' && typeof process !== 'undefined' && process.stderr) {
      process.stderr.write(outStr);
    } else {
      console.warn(outStr.trim());
    }
  }

  /* Add to buffer for batched sending */
  logBuffer.push(payload);

  if (logBuffer.length >= config.batchSize) {
    flushLogs();
  }

  /* Ensure flush timer is running */
  startFlushTimer();
}

/**
 * Flush all buffered logs to the remote API.
 * Called automatically on batch size or timer expiry.
 */
export function flushLogs(): void {
  if (logBuffer.length === 0) return;

  const batch = [...logBuffer];
  logBuffer = [];

  /* Fire and forget - do not await */
  sendLogBatch(batch).catch(() => {
    /* Error-safe: swallow any unhandled errors */
  });
}

/**
 * Start the periodic flush timer if not already running.
 */
function startFlushTimer(): void {
  if (flushTimer) return;

  const config = getLoggerConfig();
  flushTimer = setInterval(() => {
    flushLogs();
  }, config.flushIntervalMs);

  /* Allow the process to exit naturally */
  if (typeof flushTimer === 'object' && 'unref' in flushTimer) {
    flushTimer.unref();
  }
}

/**
 * Stop the flush timer and flush remaining logs.
 * Call during graceful shutdown.
 */
export function shutdownLogger(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flushLogs();
}

/* ===========================
 * Convenience Helper Methods
 * =========================== */

// Creates level helpers for a stack
export function createLogger(stack: LogStack, packageName: LogPackage) {
  return {
    debug: (message: string) => Log(stack, 'debug', packageName, message),
    info: (message: string) => Log(stack, 'info', packageName, message),
    warn: (message: string) => Log(stack, 'warn', packageName, message),
    error: (message: string) => Log(stack, 'error', packageName, message),
    fatal: (message: string) => Log(stack, 'fatal', packageName, message),
  };
}
