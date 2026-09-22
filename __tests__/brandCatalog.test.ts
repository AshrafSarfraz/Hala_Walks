import axios from 'axios';
import {fetchBrandCatalog} from '../src/halabsaudi/api/brandCatalog';
jest.mock('axios');
const get = axios.get as jest.Mock;
beforeEach(() => jest.clearAllMocks());
test('catalog includes later pages before home and category filters run', async () => {
  get.mockResolvedValueOnce({data: {data: [{_id: 'first', isBestSeller: false}], pagination: {page: 1, hasMore: true}}})
    .mockResolvedValueOnce({data: {data: [{_id: 'later', isBestSeller: true}], pagination: {page: 2, hasMore: false}}});
  const response = await fetchBrandCatalog();
  const {data} = await response.json();
  expect(data.filter(b => b.isBestSeller).map(b => b._id)).toEqual(['later']);
  expect(get.mock.calls[1][1].params.page).toBe(2);
});
test('failed later page is not returned as a complete catalog', async () => {
  get.mockResolvedValueOnce({data: {data: [{_id: 'first'}], pagination: {hasMore: true}}}).mockRejectedValueOnce(new Error('offline'));
  await expect(fetchBrandCatalog()).rejects.toThrow('offline');
});
