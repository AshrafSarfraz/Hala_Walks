import type {Socket} from 'socket.io-client';
import {demoResponse} from './session';

/** Local event source for the demo conversation. It has no network transport. */
export function createDemoSocket(): Socket {
  if (!__DEV__) throw new Error('Demo preview is available only in development builds.');
  const listeners = new Map<string, Set<(...args: any[]) => void>>();
  const dispatch = (event: string, ...args: any[]) => {
    for (const handler of Array.from(listeners.get(event) || [])) handler(...args);
  };
  const local = {
    connected: true,
    id: 'local-demo',
    on(event: string, handler: (...args: any[]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return local;
    },
    once(event: string, handler: (...args: any[]) => void) {
      const once = (...args: any[]) => {local.off(event, once); handler(...args);};
      return local.on(event, once);
    },
    off(event: string, handler?: (...args: any[]) => void) {
      if (handler) listeners.get(event)?.delete(handler); else listeners.delete(event);
      return local;
    },
    removeAllListeners() {listeners.clear(); return local;},
    connect() {local.connected = true; dispatch('connect'); return local;},
    disconnect() {local.connected = false; dispatch('disconnect', 'demo closed'); return local;},
    emit(event: string, payload?: any) {
      if (event === 'send-message') {
        const message = demoResponse('/api/messages', 'POST', payload);
        // Defer acknowledgement until the screen has added its optimistic message.
        Promise.resolve().then(() => {
          if (!local.connected) return;
          dispatch('receive-message', message);
          dispatch('chat-updated', {chatId: payload.chatId, lastMessage: message, lastMessageAt: message.createdAt, unreadCount: 0});
        });
      }
      return local;
    },
  };
  return local as unknown as Socket;
}
