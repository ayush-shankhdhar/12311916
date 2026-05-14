import { Request, Response, NextFunction } from 'express';
import { createLogger } from 'logging-middleware';

const logger = createLogger('backend', 'middleware');

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, url, ip } = req;

  logger.info(`--> API Request Received: [${method}] ${url} from ${ip}`);

  /* Intercept Response to log completion */
  const originalSend = res.send;
  res.send = function (body): Response {
    const duration = Date.now() - startTime;
    logger.info(`<-- API Response Sent: [${method}] ${url} - Status: ${res.statusCode} [${duration}ms]`);
    return originalSend.call(this, body);
  };

  next();
}
