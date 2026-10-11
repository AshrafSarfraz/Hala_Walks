import {fetchCollection} from './collection';
import {BASE_URL} from '../../config/api';
let cached: any[] | null = null;
let fetchedAt = 0;
let inflight: Promise<any[]> | null = null;
const TTL = 5 * 60 * 1000;
export async function fetchBrandCatalog(
  _url?: string,
  options?: {signal?: AbortSignal; force?: boolean},
) {
  if (options?.signal?.aborted) throw new Error('Catalog request cancelled');
  const read = () =>
    fetchCollection(
      `${BASE_URL}/api/hbs/brands`,
      {signal: options?.signal},
      'brands',
    );
  let data: any[];
  // A caller-owned signal must not cancel the shared request used by other screens.
  if (options?.signal) data = await read();
  else if (inflight) data = await inflight;
  else if (!options?.force && cached && Date.now() - fetchedAt < TTL)
    data = cached;
  else {
    inflight = read()
      .then(rows => {
        cached = rows;
        fetchedAt = Date.now();
        return rows;
      })
      .finally(() => {
        inflight = null;
      });
    data = await inflight;
  }
  return {ok: true, json: async () => ({data})};
}
