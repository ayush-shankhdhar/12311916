import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { createLogger } from 'logging-middleware';
import { env } from '../config/env';

const logger = createLogger('backend', 'handler');

let io: SocketServer | null = null;

/**
 * Initialize Socket.IO server and attach connection events
 */
export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.socketCorsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  logger.info('Socket.IO Server initialized');

  io.on('connection', (socket: Socket) => {
    const { studentId } = socket.handshake.query;
    logger.debug(`Client connected: ID=${socket.id}, studentId=${studentId}`);

    /* If student joins, assign them to their dedicated personal room */
    if (studentId) {
      const roomName = `student_${studentId}`;
      socket.join(roomName);
      logger.debug(`Socket ${socket.id} joined room: ${roomName}`);
    }

    socket.on('disconnect', () => {
      logger.debug(`Client disconnected: ID=${socket.id}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.id}: ${err.message}`);
    });
  });

  return io;
}

/**
 * Retrieves the singleton Socket.IO server instance to broadcast events anywhere in the app.
 */
export function getSocketInstance(): SocketServer | null {
  return io;
}
