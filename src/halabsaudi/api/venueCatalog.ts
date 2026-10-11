import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config/api';
import {fetchCollection} from './collection';
const KEY = 'H-venues_cache_v3';
const TTL = 3 * 60 * 60 * 1000;
let cache: {ts: number; data: any[]} | null = null;
let inflight: Promise<any[]> | null = null;
export async function fetchVenueCatalog(force = false): Promise<any[]> {
  if (inflight) return inflight;
  inflight = (async () => {
    if (!cache) {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed?.data)) cache = parsed;
      } catch {}
    }
    if (!force && cache && Date.now() - cache.ts < TTL) return cache.data;
    try {
      const data = await fetchCollection(
        `${BASE_URL}/api/hbs/venues`,
        {},
        'venues',
      );
      cache = {ts: Date.now(), data};
      await AsyncStorage.setItem(KEY, JSON.stringify(cache)).catch(() => {});
      return data;
    } catch (error) {
      if (cache) return cache.data;
      throw error;
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}
