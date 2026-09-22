import {createMMKV} from 'react-native-mmkv';
import {getCachedMessages, setCachedMessages, pushToQueue, getQueue, clearQueue, clearAllChatData} from '../src/halabsaudi/chat/chatStorage';
jest.mock('react-native-mmkv', () => {
  const values = new Map();
  return {createMMKV: jest.fn(() => ({getString: (key: string) => values.get(key), set: (key: string, value: string) => values.set(key, value), remove: (key: string) => values.delete(key), clearAll: () => values.clear()}))};
});
afterEach(clearAllChatData);
test('uses the installed MMKV v4 factory and caps saved history at 200', () => {
  expect(createMMKV).toHaveBeenCalledWith({id: 'hala-chat-cache'});
  setCachedMessages('a', Array.from({length: 250}, (_, i) => ({_id: i})));
  expect(getCachedMessages('a')).toHaveLength(200);
});
test('queue removal uses v4 remove and logout clears cached messages', () => {
  pushToQueue('a', {tempId: 'pending'}); expect(getQueue('a')).toHaveLength(1);
  clearQueue('a'); expect(getQueue('a')).toEqual([]);
  setCachedMessages('a', [{_id: 'one'}]); clearAllChatData(); expect(getCachedMessages('a')).toBeNull();
});
