import axios from 'axios';
import {fetchCollection} from '../src/halabsaudi/api/collection';
jest.mock('axios');
const get = axios.get as jest.Mock;
beforeEach(() => jest.clearAllMocks());
test('reads every page and deduplicates overlap', async () => {
  get.mockResolvedValueOnce({data: {users: [{_id: '1'}], hasMore: true}})
    .mockResolvedValueOnce({data: {users: [{_id: '1'}, {_id: '2'}], hasMore: false}});
  expect(await fetchCollection('/users', {}, 'users')).toEqual([{_id: '1'}, {_id: '2'}]);
  expect(get.mock.calls[1][1].params.page).toBe(2);
});
test('passes the next cursor, and handles legacy arrays', async () => {
  get.mockResolvedValueOnce({data: {chats: [{_id: '1'}], hasMore: true, nextCursor: 'older'}})
    .mockResolvedValueOnce({data: [{_id: '2'}]});
  expect(await fetchCollection('/chat', {}, 'chats')).toHaveLength(2);
  expect(get.mock.calls[1][1].params.before).toBe('older');
});
test('network errors are visible to the caller instead of pretending the list is empty', async () => {
  get.mockRejectedValue(new Error('offline'));
  await expect(fetchCollection('/chat', {}, 'chats')).rejects.toThrow('offline');
});
test('rejects a repeating cursor instead of loading forever', async () => {
  get.mockResolvedValue({data: {chats: [{_id: '1'}], hasMore: true, nextCursor: 'stuck'}});
  await expect(fetchCollection('/chat', {}, 'chats')).rejects.toThrow('Invalid pagination');
  expect(get).toHaveBeenCalledTimes(2);
});
