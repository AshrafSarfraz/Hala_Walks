import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useRef, useState} from 'react';
import {CollectionPage, fetchCollectionPage, mergeById} from '../api/page';

// Fetch only visible pages. Refresh retains content until the loaded pages are ready.
export function usePagedCollection<T extends {_id?: string; id?: string}>(
  url: string,
  keys: string[],
  params: Record<string, any> = {},
) {
  const keyString = JSON.stringify(keys);
  const paramString = JSON.stringify(params);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const metadata = useRef({
    page: 0,
    cursor: null as string | null,
    hasMore: false,
  });
  const request = useRef<AbortController | null>(null);
  const version = useRef(0);
  const busy = useRef(false);
  const clear = useCallback(() => {
    version.current++;
    request.current?.abort();
    busy.current = false;
    metadata.current = {page: 0, cursor: null, hasMore: false};
    setItems([]);
    setLoading(true);
    setHasMore(false);
    setTotal(null);
    setError(null);
    setRefreshing(false);
    setLoadingMore(false);
  }, []);
  useEffect(
    () => () => {
      version.current++;
      request.current?.abort();
    },
    [],
  );
  const read = useCallback(
    async (append: boolean, signal?: AbortSignal) => {
      if (
        signal?.aborted ||
        (append && (busy.current || !metadata.current.hasMore))
      )
        return;
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      const id = ++version.current;
      busy.current = true;
      const abort = () => controller.abort();
      signal?.addEventListener('abort', abort);
      if (append) setLoadingMore(true);
      try {
        const token = await AsyncStorage.getItem('hala_token');
        if (!token) throw new Error('Please sign in again.');
        const config = {
          headers: {Authorization: `Bearer ${token}`},
          signal: controller.signal,
          params: JSON.parse(paramString),
        };
        let page: CollectionPage<T>;
        let rows: T[] = [];
        if (append) {
          page = await fetchCollectionPage<T>(
            url,
            config,
            JSON.parse(keyString),
            metadata.current.page + 1,
            metadata.current.cursor,
          );
          rows = page.items;
        } else {
          const count = Math.max(1, metadata.current.page);
          let cursor: string | null = null;
          page = {
            items: [],
            hasMore: false,
            nextCursor: null,
            page: 0,
            total: null,
          };
          for (let n = 1; n <= count; n++) {
            page = await fetchCollectionPage<T>(
              url,
              config,
              JSON.parse(keyString),
              n,
              cursor,
            );
            rows.push(...page.items);
            if (!page.hasMore) break;
            cursor = page.nextCursor;
          }
        }
        if (id !== version.current || controller.signal.aborted) return;
        metadata.current = {
          page: page.page,
          cursor: page.nextCursor,
          hasMore: page.hasMore,
        };
        setItems(old => mergeById(append ? [...old, ...rows] : rows));
        setHasMore(page.hasMore);
        setTotal(page.total);
        setError(null);
      } catch (e: any) {
        if (id === version.current && !controller.signal.aborted) {
          setError(e);
          // Authorization failures must not retain restricted content.
          if (e.response?.status === 403 || e.response?.status === 401) {
            setItems([]);
            setHasMore(false);
            metadata.current = {page: 0, cursor: null, hasMore: false};
          }
        }
      } finally {
        signal?.removeEventListener('abort', abort);
        if (id === version.current) {
          busy.current = false;
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [url, keyString, paramString],
  );
  const refresh = useCallback(
    (signal?: AbortSignal) => read(false, signal),
    [read],
  );
  const pullRefresh = useCallback(async () => {
    setRefreshing(true);
    await read(false);
  }, [read]);
  const loadMore = useCallback(() => read(true), [read]);
  return {
    items,
    setItems,
    loading,
    setLoading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    total,
    clear,
    refresh,
    pullRefresh,
    loadMore,
  };
}
