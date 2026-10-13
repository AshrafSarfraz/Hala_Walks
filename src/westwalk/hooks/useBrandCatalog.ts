import {useEffect, useSyncExternalStore} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {firestore} from '../firebase/firebaseconfig';
const CACHE_KEY = 'brands_cache';
let state: {brands: any[]; loading: boolean; error: boolean} = {
  brands: [],
  loading: true,
  error: false,
};
let inFlight: Promise<void> | null = null;
let hydrated = false;
let lastFetch = 0;
const listeners = new Set<() => void>();
const emit = (next: typeof state) => {
  state = next;
  listeners.forEach(l => l());
};
export function refreshBrandCatalog(force = false): Promise<void> {
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastFetch < 60000) return Promise.resolve();
  inFlight = (async () => {
    if (!hydrated) {
      hydrated = true;
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        const cached = raw ? JSON.parse(raw) : null;
        if (Array.isArray(cached) && cached.length)
          emit({brands: cached, loading: false, error: false});
      } catch {
        /* Ignore corrupt cache; refresh from the existing collection. */
      }
    }
    try {
      const snapshot = await firestore().collection('Brands').get();
      const brands = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      lastFetch = Date.now();
      emit({brands, loading: false, error: false});
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(brands));
    } catch {
      emit({...state, loading: false, error: true});
    }
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
export async function getBrandCatalog(force = false): Promise<any[]> {
  await refreshBrandCatalog(force);
  return state.brands;
}
const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
export default function useBrandCatalog() {
  const current = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    void refreshBrandCatalog();
  }, []);
  return current;
}
