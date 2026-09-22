import {dateLabel, mergeMessages, messagePage} from '../src/halabsaudi/chat/messageModel';
import {unwrap, unwrapMeta} from '../src/halabsaudi/api/unwrap';
const msg = (_id: string, day: number, tempId?: string) => ({_id, createdAt: new Date(2026, 8, day), tempId});
test('newest first regardless of server order; overlapping history does not duplicate', () => {
  expect(mergeMessages([msg('a', 1), msg('c', 3), msg('b', 2), msg('a', 1)]).map(m => m._id)).toEqual(['c', 'b', 'a']);
});
test('confirmed server ID replaces a matching optimistic temp ID', () => {
  expect(mergeMessages([msg('server', 2, 'temp'), msg('temp', 2, 'temp')])).toHaveLength(1);
});
test('explicit hasMore overrides page length; old and nested response shapes work', () => {
  expect(messagePage({messages: [msg('a', 1)], hasMore: true}).hasMore).toBe(true);
  expect(messagePage({messages: Array.from({length: 20}, (_, i) => msg(String(i), 1)), hasMore: false}).hasMore).toBe(false);
  expect(messagePage({data: {messages: [msg('a', 1)], pagination: {hasMore: false}}}).messages).toHaveLength(1);
  expect(unwrap([1, 2])).toEqual([1, 2]);
  expect(unwrap({data: {users: [1, 2]}}, 'users')).toEqual([1, 2]);
  expect(unwrapMeta({data: {pagination: {total: 120, hasMore: true}}}).total).toBe(120);
});
test('date separators use local day boundaries and support Arabic', () => {
  const today = new Date(2026, 8, 22, 12);
  expect(dateLabel(new Date(2026, 8, 22), 'en', today)).toBe('Today');
  expect(dateLabel(new Date(2026, 8, 21, 23), 'en', today)).toBe('Yesterday');
  expect(dateLabel(today, 'ar', today)).toBe('اليوم');
  expect(dateLabel('invalid', 'en', today)).toBe('');
});

test('retains the backend history cursor for stable older-message loading', () => {
  const cursor = '2026-09-22T10:00:00.000Z|000000000000000000000001';
  expect(messagePage({messages: [], pagination: {hasMore: true, nextCursor: cursor}}).nextCursor).toBe(cursor);
});
