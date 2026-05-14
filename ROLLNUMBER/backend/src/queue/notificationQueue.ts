import { createLogger } from 'logging-middleware';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { getSocketInstance } from '../realtime/socket';

const logger = createLogger('backend', 'cron job'); /* Simulating worker/queue background tasks */

export interface JobPayload {
  type: 'BULK_CREATE' | 'EMAIL_SEND' | 'PUSH_SEND';
  data: any;
  attempt?: number;
}

const MAX_RETRIES = 3;
const repository = new NotificationRepository();

/**
 * Simulated highly scalable Queue worker system (similar to BullMQ + Redis).
 * Processes bulk notifications asynchronously and simulates side-effects like email/push dispatch.
 */
export async function addToNotificationQueue(job: JobPayload): Promise<void> {
  job.attempt = job.attempt || 1;
  logger.info(`Queue task enqueued: Type=${job.type}. Attempt=${job.attempt}`);

  /* Defer execution to simulate asynchronous task processing on worker nodes */
  setImmediate(async () => {
    try {
      await processJob(job);
    } catch (error: any) {
      logger.error(`Job failure in worker: ${error.message}`);
      await handleRetry(job);
    }
  });
}

async function processJob(job: JobPayload): Promise<void> {
  logger.info(`Worker processing job type: ${job.type}`);

  switch (job.type) {
    case 'BULK_CREATE': {
      const records = job.data;
      
      /* 1. DB Write Phase */
      const formattedRecords = records.map((rec: any) => {
        const weightMap: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };
        const baseScore = (weightMap[rec.type] || 0) * 1e10;
        return {
          ...rec,
          priorityScore: baseScore + Math.floor(Date.now() / 1000),
          isRead: false,
        };
      });

      logger.debug(`Processing DB Writes for ${formattedRecords.length} items`);
      const saved = await repository.createMany(formattedRecords);
      logger.info(`Successfully completed bulk DB writes for ${saved.length} items`);

      /* 2. Event Driven Triggering: Fire Email/Push jobs for all */
      await addToNotificationQueue({
        type: 'EMAIL_SEND',
        data: { count: saved.length, list: saved.map(s => s._id) }
      });

      await addToNotificationQueue({
        type: 'PUSH_SEND',
        data: { saved }
      });

      break;
    }

    case 'EMAIL_SEND':
      /* Simulated External Integration: Email provider gateway */
      logger.info(`[External API Simulate] Dispatching ${job.data.count} transaction emails to students...`);
      await sleep(500); // Simulating IO delay
      logger.info('[External API Simulate] Emails sent successfully via simulated Mailgun/SES gateway');
      break;

    case 'PUSH_SEND': {
      /* Simulated Realtime Triggering for the bulk list */
      logger.info(`[Real-time Push System] Broadcast to connected websockets`);
      const io = getSocketInstance();
      if (io) {
        io.emit('notification:bulk_new', job.data.saved);
      }
      break;
    }

    default:
      logger.warn(`Unknown job type dispatched: ${job.type}`);
  }
}

async function handleRetry(job: JobPayload): Promise<void> {
  const currentAttempt = job.attempt || 1;
  if (currentAttempt < MAX_RETRIES) {
    const nextAttempt = currentAttempt + 1;
    const backoffDelay = Math.pow(2, currentAttempt) * 1000;
    logger.warn(`Retrying job ${job.type} in ${backoffDelay}ms (Next Attempt: ${nextAttempt})`);
    
    await sleep(backoffDelay);
    await addToNotificationQueue({ ...job, attempt: nextAttempt });
  } else {
    logger.fatal(`Job of type ${job.type} failed permanently after ${MAX_RETRIES} attempts. Pushed to Dead Letter Queue (DLQ).`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
