// src/halabsaudi/api/unwrap.ts
//
// ═══════════════════════════════════════════════════════════════════════
//  BACKEND KA RESPONSE SHAPE BADAL GAYA HAI
// ═══════════════════════════════════════════════════════════════════════
//
//  Backend par pagination lagne ki wajah se teen endpoints ab array ke
//  bajaye object dete hain:
//
//    GET /api/chat            pehle: [...]  ab: { chats, hasMore, nextCursor }
//    GET /api/users           pehle: [...]  ab: { users, page, limit, hasMore }
//    GET /api/chat/:id/media  pehle: [...]  ab: { media, hasMore, nextCursor }
//
//  App me abhi ye likha hai:
//      (res.data || []).map(...)
//
//  Object par `.map` nahi chalta — screen khali ya crash.
//  Yehi wajah hai ke chat list aur user list load nahi ho rahi thin.
//
//  `unwrap()` DONO shapes handle karta hai. Faida:
//    - purane backend par bhi app chalti hai
//    - naye par bhi
//    - deploy ka order masla nahi banta
//    - backend rollback karna pare to app phir bhi chalti hai

/**
 * Response me se array nikalo, shape jo bhi ho.
 *
 * @param data  axios ka res.data
 * @param keys  naye shape me array kis key par hai ('chats', 'users'...)
 */
export function unwrap<T = any>(data: any, ...keys: string[]): T[] {
  // Purana shape — seedha array
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === 'object') {
    // Naya shape — jo key batayi gayi
    for (const k of keys) {
      if (Array.isArray(data[k])) return data[k] as T[];
    }
    // Some controllers wrap a named collection inside {data: {...}}.
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      for (const k of [...keys, 'items', 'results', 'list']) {
        if (Array.isArray(data.data[k])) return data.data[k] as T[];
      }
    }
    // Aam shapes jo backend me istemal hote hain
    for (const k of ['data', 'items', 'results', 'list']) {
      if (Array.isArray(data[k])) return data[k] as T[];
    }
  }

  return [];
}

/** Pagination meta nikalo (na mile to safe defaults) */
export function unwrapMeta(data: any): {
  hasMore: boolean;
  nextCursor: string | null;
  page: number;
  total: number | null;
} {
  const p = data?.pagination || data?.data?.pagination || data?.data || data || {};
  return {
    hasMore: Boolean(p.hasMore),
    nextCursor: p.nextCursor ?? data?.nextCursor ?? null,
    page: Number(p.page) || 1,
    total: p.total ?? null,
  };
}

// Tayyar helpers — call site par key yaad na rakhni pare
export const unwrapChats    = (d: any) => unwrap(d, 'chats');
export const unwrapUsers    = (d: any) => unwrap(d, 'users');
export const unwrapMedia    = (d: any) => unwrap(d, 'media');
export const unwrapMessages = (d: any) => unwrap(d, 'messages');
export const unwrapBrands   = (d: any) => unwrap(d, 'data', 'brands');

export default unwrap;
