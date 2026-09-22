import axios, {AxiosRequestConfig} from 'axios';
import {unwrap, unwrapMeta} from './unwrap';
/** Read both legacy arrays and paginated collection responses without losing later pages. */
export async function fetchCollection(url: string, config: AxiosRequestConfig, ...keys: string[]) {
  const collected: any[] = [];
  const cursors = new Set<string>();
  let cursor: string | null = null;
  for (let page = 1; page <= 100; page++) {
    const response = await axios.get(url, {...config, timeout: config.timeout ?? 15000,
      params: {...config.params, limit: 100, page, pagination: 'true', ...(cursor ? {before: cursor} : {})}});
    const items = unwrap(response.data, ...keys);
    collected.push(...items);
    const meta = unwrapMeta(response.data);
    if (!meta.hasMore) {
      const ids = new Set<string>();
      return collected.filter(item => {
        const id = item?._id || item?.id;
        if (!id) return true;
        if (ids.has(String(id))) return false;
        ids.add(String(id)); return true;
      });
    }
    if (!items.length || (meta.nextCursor && cursors.has(meta.nextCursor))) throw new Error('Invalid pagination response');
    cursor = meta.nextCursor;
    if (cursor) cursors.add(cursor);
  }
  throw new Error('Too many pages. Please narrow the results.');
}
