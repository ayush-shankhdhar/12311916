import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initSocketServer } from './realtime/socket';
import { createLogger, shutdownLogger } from 'logging-middleware';

const logger = createLogger('backend', 'config');

const server = http.createServer(app);

async function bootstrap() {
  try {
    /* Connect MongoDB first */
    await connectDatabase();

    /* Start Socket.IO Layer */
    initSocketServer(server);

    /* Fire Up Main Server listening */
    server.listen(env.port, () => {
      logger.info(`>>> Campus Notification API successfully booted on port ${env.port} <<<`);
    });
  } catch (error: any) {
    logger.fatal(`Failed to bootstrap server: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();

/* Handle SIGTERM and SIGINT graceful shutdowns for production reliability */
async function shutdownGracefully(signal: string) {
  logger.warn(`Received signal ${signal}. Starting graceful teardown...`);
  
  server.close(async () => {
    logger.info('Stopped receiving new HTTP connections.');
    
    /* Close database pool */
    await disconnectDatabase();
    
    /* Flush and close logging channel */
    logger.info('Flushing logs prior to process exit');
    shutdownLogger();
    
    process.exit(0);
  });

  /* If not exited in 10 seconds, force crash */
  setTimeout(() => {
    process.stderr.write('Forced shutdown threshold met. Exiting process immediately.\n');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
