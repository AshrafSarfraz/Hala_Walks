import {fetchCollection} from './collection';
import {BASE_URL} from '../../config/api';
// Compatibility adapter for existing catalog screens: resolve all server pages
// before their local country/category/offer filters run. Errors reject normally.
export async function fetchBrandCatalog(_url?: string, options?: {signal?: AbortSignal}) {
  const data = await fetchCollection(`${BASE_URL}/api/hbs/brands`, {signal: options?.signal}, 'brands');
  return {ok: true, json: async () => ({data})};
}
