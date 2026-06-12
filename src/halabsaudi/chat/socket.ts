// src/halabsaudi/chat/socket.ts
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../../config/api';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(BASE_URL, {
    // ✅ FIX: polling pehle, phir websocket upgrade
    // Render free tier pe pure websocket transport error deta hai
    transports: ['polling', 'websocket'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 15000,
    timeout: 30000,
  });

  socket.on('connect', () => {
    console.log('[SOCKET] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason: string) => {
    console.log('[SOCKET] Disconnected:', reason);
  });

  socket.on('connect_error', (err: any) => {
    console.log('[SOCKET] Error:', err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log('[SOCKET] Manually disconnected');
  }
};