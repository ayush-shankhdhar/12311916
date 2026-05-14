/**
 * Logging Middleware - Type Definitions
 *
 * Defines strict types for the logging service to enforce correct usage
 * across frontend and backend stacks.
 */

/** Allowed stack values */
export type LogStack = 'backend' | 'frontend';

/** Allowed log severity levels */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Backend-specific package names */
export type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron job'
  | 'db'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';

/** Frontend-specific package names */
export type FrontendPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';

/** Common package names shared across stacks */
export type CommonPackage = 'auth' | 'config' | 'middleware' | 'utils';

/** Union of all valid package names */
export type LogPackage = BackendPackage | FrontendPackage | CommonPackage;

/** Payload sent to the logging API */
export interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  packageName: LogPackage;
  message: string;
  timestamp: string;
}

/** Configuration options for the logger */
export interface LoggerConfig {
  apiUrl: string;
  bearerToken: string;
  maxRetries?: number;
  retryDelayMs?: number;
  enableConsole?: boolean;
  batchSize?: number;
  flushIntervalMs?: number;
}
