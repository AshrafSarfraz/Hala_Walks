// src/halabsaudi/chat/chatStorage.ts
//
// Persistent local cache for chat messages + the offline send queue.
// Backed by MMKV: synchronous, fast, and — unlike a plain in-memory
// Map — it survives app restarts and kills.
//
// npm install react-native-mmkv
// (then `cd ios && pod install` if you're on bare RN with iOS)

import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({id: 'hala-chat-cache'});

// ── Message cache ───────────────────────────────────────────────────────────
export function getCachedMessages<T>(chatId: string): T[] | null {
  const raw = storage.getString(`messages:${chatId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return null;
  }
}

export function setCachedMessages<T>(chatId: string, messages: T[]) {
  // Cap what's persisted per chat so disk usage doesn't grow unbounded.
  // Older history still comes from the API via your existing loadMore().
  storage.set(`messages:${chatId}`, JSON.stringify(messages.slice(0, 200)));
}

// ── Offline outgoing queue ──────────────────────────────────────────────────
export function getQueue<T>(chatId: string): T[] {
  const raw = storage.getString(`queue:${chatId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function pushToQueue<T>(chatId: string, item: T) {
  const q = getQueue<T>(chatId);
  q.push(item);
  storage.set(`queue:${chatId}`, JSON.stringify(q));
}

export function removeFromQueue<T extends {tempId: string}>(
  chatId: string,
  tempId: string,
) {
  const q = getQueue<T>(chatId).filter(i => i.tempId !== tempId);
  storage.set(`queue:${chatId}`, JSON.stringify(q));
}

export function clearQueue(chatId: string) {
  storage.delete(`queue:${chatId}`);
}

// ── Last-synced marker (optional, for a future delta-sync API) ─────────────
export function getLastSyncedAt(chatId: string): string | null {
  return storage.getString(`lastSync:${chatId}`) || null;
}

export function setLastSyncedAt(chatId: string, iso: string) {
  storage.set(`lastSync:${chatId}`, iso);
}

// ── Logout ───────────────────────────────────────────────────────────────
// Call this wherever you currently clear the auth token on logout, so a
// second account on the same device never sees a previous user's chats.
export function clearAllChatData() {
  storage.clearAll();
}
