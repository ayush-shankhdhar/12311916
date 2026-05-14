import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { initAppLogger } from './config/logger';
import { createLogger } from 'logging-middleware';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import notificationRouter from './routes/notificationRoutes';

/* 1. Initialize Logging Middleware Config First */
initAppLogger();
const logger = createLogger('backend', 'config');

const app: Application = express();

/* 2. Middlewares Setup */
app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Integrated logging middleware on first routes */
app.use(requestLogger);

logger.info('Configured global Express middleware stack');

/* 3. API Routes */
app.use('/api/notifications', notificationRouter);

/* Healthcheck endpoint */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

/* 4. Error Handling Pipeline */
app.use(errorHandler);

export default app;
