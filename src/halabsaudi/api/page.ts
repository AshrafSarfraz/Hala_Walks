import axios, {AxiosRequestConfig} from 'axios';
import {unwrap, unwrapMeta} from './unwrap';

export type CollectionPage<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  page: number;
  total: number | null;
};
export async function fetchCollectionPage<T = any>(
  url: string,
  config: AxiosRequestConfig,
  keys: string[],
  page = 1,
  before: string | null = null,
  limit = 30,
): Promise<CollectionPage<T>> {
  const response = await axios.get(url, {
    ...config,
    timeout: config.timeout ?? 15000,
    params: {
      ...config.params,
      limit,
      page,
      pagination: 'true',
      ...(before ? {before} : {}),
    },
  });
  const items = unwrap<T>(response.data, ...keys);
  const meta = unwrapMeta(response.data);
  if (
    meta.hasMore &&
    (!items.length || (before && meta.nextCursor === before))
  ) {
    throw new Error('Invalid pagination response');
  }
  return {items, ...meta, page};
}
export function mergeById<T extends {_id?: string; id?: string}>(
  items: T[],
): T[] {
  const positions = new Map<string, number>();
  const result: T[] = [];
  for (const item of items) {
    const id = item._id || item.id;
    if (!id) {
      result.push(item);
      continue;
    }
    const index = positions.get(String(id));
    if (index === undefined) {
      positions.set(String(id), result.length);
      result.push(item);
    } else result[index] = item;
  }
  return result;
}
