
type NativeStorage = ReturnType<typeof import('react-native-mmkv').createMMKV>;
let native: NativeStorage | null = null;
let attempted = false;
const memory = new Map<string, string>();
function getNative(): NativeStorage | null {
  if (!attempted) {
    attempted = true;
    try {
      const {createMMKV} =
        require('react-native-mmkv') as typeof import('react-native-mmkv');
      native = createMMKV({id: 'hala-chat-cache'});
    } catch (error) {
      console.warn(
        '[HBS chat storage] Native cache unavailable; using session memory.',
        error,
      );
    }
  }
  return native;
}
const storage = {
  getString(key: string): string | undefined {
    try {
      const value = getNative()?.getString(key);
      if (typeof value === 'string') {
        memory.set(key, value);
        return value;
      }
    } catch {
      native = null;
    }
    return memory.get(key);
  },
  set(key: string, value: string) {
    memory.set(key, value);
    try {
      getNative()?.set(key, value);
    } catch {
      native = null;
    }
  },
  remove(key: string) {
    memory.delete(key);
    try {
      getNative()?.remove(key);
    } catch {
      native = null;
    }
  },
  clearAll() {
    memory.clear();
    // Clear persisted caches when available; a native failure cannot block logout.
    try {
      getNative()?.clearAll();
    } catch {
      native = null;
    }
  },
};

// ── Message cache ───────────────────────────────────────────────────────────
export function getCachedMessages<T>(chatId: string): T[] | null {
  const raw = storage.getString(`messages:${chatId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
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
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
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
  storage.remove(`queue:${chatId}`);
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
