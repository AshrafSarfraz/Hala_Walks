import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchCollection} from './collection';
import {BASE_URL} from '../../config/api';
const CACHE_KEY = 'hbs_brand_catalog_v1';
const TTL = 5 * 60 * 1000;
let cached: {ts: number; data: any[]} | null = null;
let inFlight: Promise<any[]> | null = null;
async function loadCatalog(): Promise<any[]> {
  if (!cached) {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Array.isArray(parsed.data)) cached = parsed;
    } catch {}
  }
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  const data = await fetchCollection(
    `${BASE_URL}/api/hbs/brands`,
    {},
    'brands',
  );
  cached = {ts: Date.now(), data};
  void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached)).catch(() => {});
  return data;
}
export async function fetchBrandCatalog(
  _url?: string,
  options?: {signal?: AbortSignal},
) {
  if (options?.signal?.aborted) throw new Error('Catalog request cancelled');
  if (!inFlight)
    inFlight = loadCatalog().finally(() => {
      inFlight = null;
    });
  const data = await inFlight;
  if (options?.signal?.aborted) throw new Error('Catalog request cancelled');
  return {ok: true, json: async () => ({data})};
}
