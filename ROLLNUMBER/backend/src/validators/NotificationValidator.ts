import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiResponse';
import { createLogger } from 'logging-middleware';

const logger = createLogger('backend', 'middleware');

export class NotificationValidator {
  /**
   * Validates creation payload
   */
  public static validateCreate(req: Request, res: Response, next: NextFunction) {
    const { studentId, type, message } = req.body;
    const errors: string[] = [];

    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      errors.push('studentId must be a non-empty string');
    }

    const validTypes = ['Event', 'Result', 'Placement'];
    if (!type || !validTypes.includes(type)) {
      errors.push(`type must be one of: ${validTypes.join(', ')}`);
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      errors.push('message must be a non-empty string');
    }

    if (errors.length > 0) {
      logger.warn(`Validation errors during notification create: ${errors.join('; ')}`);
      return next(new ApiError(400, 'Validation failed', errors));
    }

    next();
  }

  /**
   * Validates bulk creation array
   */
  public static validateBulkCreate(req: Request, res: Response, next: NextFunction) {
    const notifications = req.body;
    const errors: string[] = [];

    if (!Array.isArray(notifications)) {
      errors.push('Request body must be a JSON array of notifications');
      return next(new ApiError(400, 'Validation failed', errors));
    }

    if (notifications.length === 0) {
      errors.push('Request array cannot be empty');
      return next(new ApiError(400, 'Validation failed', errors));
    }

    const validTypes = ['Event', 'Result', 'Placement'];
    notifications.forEach((item, index) => {
      if (!item.studentId || typeof item.studentId !== 'string') {
        errors.push(`Item [${index}]: studentId must be string`);
      }
      if (!item.type || !validTypes.includes(item.type)) {
        errors.push(`Item [${index}]: type is invalid`);
      }
      if (!item.message || typeof item.message !== 'string') {
        errors.push(`Item [${index}]: message is required`);
      }
    });

    if (errors.length > 0) {
      logger.warn(`Validation errors during bulk creation: ${errors.length} error instances`);
      return next(new ApiError(400, 'Validation failed', errors));
    }

    next();
  }
}
