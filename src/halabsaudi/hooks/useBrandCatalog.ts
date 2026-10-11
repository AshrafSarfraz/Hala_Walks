// Brands ka data poori app mein EK hi jagah se aata hai.
// - FlatOffer, BestSeller, RecentlyAdded, Deals sab isi ko use karte hain
// - API sirf ek baar call hoti hai (pehle har component alag call karta tha)
// - Cache foran dikhta hai, fresh data background mein aata hai
// - 5 minute ke andar dobara API call nahi hoti (bar bar load nahi)
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import {fetchBrandCatalog} from '../api/brandCatalog';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';
const CACHE_KEY = 'H-brand_catalog_v1';
const STALE_MS = 5 * 60 * 1000;

type State = {data: any[]; ts: number; loading: boolean; error: boolean};

let state: State = {data: [], ts: 0, loading: true, error: false};
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let hydrating: Promise<void> | null = null;
let appStateHooked = false;

const setState = (patch: Partial<State>) => {
  state = {...state, ...patch};
  listeners.forEach(l => l());
};

/* ---------------- helpers (export) ---------------- */
export const norm = (v: any) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

export const sameCountry = (a: any, b: any) => !!b && norm(a) === norm(b);

export const isActive = (item: any) => norm(item?.status) === 'active';

// Deals screen pe kam se kam itna discount hona chahiye
export const MIN_DEAL_PERCENT = 20;

// Discount kisi bhi field mein ho sakta hai: 25, "25", "25%", "Flat 25% OFF"
// Agar API mein discount ki field ka naam alag hai to yahan add kar do.
const DISCOUNT_FIELDS = [
  'discountPercentage',
  'discountPercent',
  'discount',
  'offerPercentage',
  'offerPercent',
  'percentage',
  'offer',
  'offerText',
  'offerEng',
];

export const getDiscountPercent = (item: any): number => {
  let best = 0;
  for (const f of DISCOUNT_FIELDS) {
    const v = item?.[f];
    if (v == null || v === '' || typeof v === 'boolean') continue;
    let n = NaN;
    if (typeof v === 'number') {
      n = v;
    } else {
      const s = String(v);
      const m =
        s.match(/(\d+(?:\.\d+)?)\s*%/) || s.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
      if (m) n = parseFloat(m[1]);
    }
    if (Number.isFinite(n) && n > best && n <= 100) best = n;
  }
  return Math.round(best);
};

const normalize = (arr: any[]) =>
  arr.map(item => ({
    ...item,
    id: String(item._id || item.id),
    createdAtMs: new Date(
      item.createdAt || item.created_at || item.time,
    ).getTime(),
  }));

/* ---------------- cache + fetch ---------------- */
const hydrate = () => {
  if (!hydrating) {
    hydrating = (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.data) && !state.data.length) {
            setState({data: parsed.data, ts: parsed.ts ?? 0, loading: false});
          }
        }
      } catch {
        // cache kharab ho to ignore, API se aa jayega
      }
    })();
  }
  return hydrating;
};

export const refreshBrandCatalog = (force = false): Promise<void> => {
  if (inflight) return inflight;
  if (!force && state.ts && Date.now() - state.ts < STALE_MS)
    return Promise.resolve();

  inflight = (async () => {
    try {
      const res = await fetchBrandCatalog(BRANDS_API, {force});
      const json: any = await res.json();
      if (!res.ok) throw new Error('Brands API failed');
      const raw = json?.data ?? json;
      const fresh = normalize(Array.isArray(raw) ? raw : []);

      // Sirf tab UI update karo jab data sach mein badla ho (flicker nahi)
      const changed = JSON.stringify(fresh) !== JSON.stringify(state.data);
      const ts = Date.now();
      setState({
        ...(changed ? {data: fresh} : {}),
        ts,
        loading: false,
        error: false,
      });
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ts, data: fresh})).catch(
        () => {},
      );
    } catch (e) {
      console.log('Brand catalog error:', e);
      setState({loading: false, error: true});
    } finally {
      inflight = null;
    }
  })();
  return inflight;
};

/* ---------------- hook ---------------- */
export function useBrandCatalog() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender(n => n + 1);
    listeners.add(listener);
    hydrate().then(() => refreshBrandCatalog());

    // App wapas foreground mein aaye to (5 min baad) chupke se refresh
    if (!appStateHooked) {
      appStateHooked = true;
      AppState.addEventListener('change', s => {
        if (s === 'active') refreshBrandCatalog();
      });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    brands: state.data,
    loading: state.loading && state.data.length === 0,
    error: state.error,
    refresh: () => refreshBrandCatalog(true),
  };
}
