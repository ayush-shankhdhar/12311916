import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../utils/ApiResponse';
import { createLogger } from 'logging-middleware';
import { env } from '../config/env';

const logger = createLogger('backend', 'middleware');

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = 500;
  let message = 'An unexpected application error occurred';
  let errors: any[] = [];

  /* Handle known Operational API Errors */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    logger.warn(`Client Request Error: ${statusCode} - ${message}`);
  } 
  /* Handle MongoDB Validation Errors */
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values((err as any).errors).map((e: any) => e.message);
    logger.warn(`DB Validation Fail: ${message}`);
  } 
  /* Handle Generic App Errors */
  else {
    logger.error(`Critical App Error: ${err.message}\nStack: ${err.stack}`);
    if (env.nodeEnv === 'development') {
      message = err.message;
    }
  }

  res.status(statusCode).json(
    new ApiResponse(false, message, errors.length > 0 ? errors : null)
  );
}
