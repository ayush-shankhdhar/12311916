import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { clientLog } from '../services/logger';
import { INotification } from '../types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const useSocket = (studentId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<INotification | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    clientLog('debug', 'hook', `Initializing WebSocket Client`);
    
    const socket = io(SOCKET_URL, {
      query: studentId ? { studentId } : {},
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      clientLog('info', 'hook', `Websocket connected: ${socket.id}`);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      clientLog('warn', 'hook', `Websocket disconnected`);
      setIsConnected(false);
    });

    socket.on('notification:new', (data: INotification) => {
      clientLog('info', 'hook', `Live single notification push received for id ${data._id}`);
      setLastMessage(data);
    });

    socket.on('notification:global', (data: INotification) => {
      clientLog('info', 'hook', `Global channel push received`);
      setLastMessage(data);
    });

    return () => {
      clientLog('debug', 'hook', `Destroying socket connections`);
      socket.disconnect();
    };
  }, [studentId]);

  return { isConnected, lastMessage, socket: socketRef.current };
};
