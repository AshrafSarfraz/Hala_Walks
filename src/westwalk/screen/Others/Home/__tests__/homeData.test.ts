import {
  chunk,
  discountDeals,
  eventTimestamp,
  homeTimestamp,
  isBestSeller,
  recentlyAdded,
  timeAgo,
} from '../homeData';
test('recent section returns latest six, including entries older than one month', () => {
  const data = Array.from({length: 9}, (_, i) => ({
    id: String(i),
    time: {seconds: 100 + i},
  }));
  expect(recentlyAdded(data).map(item => item.id)).toEqual([
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
  ]);
  expect(data[0].id).toBe('0');
});
test('best seller flag accepts boolean, numeric and normalized string values without flagging no/false', () => {
  for (const value of ['yes', ' Yes ', 'TRUE', '1', true, 1])
    expect(isBestSeller({isBestSeller: value})).toBe(true);
  for (const value of ['no', 'false', '0', false, 0, undefined])
    expect(isBestSeller({isBestSeller: value})).toBe(false);
});
test('date sorting supports Firestore cache, ISO dates and fallback from invalid fields', () => {
  expect(homeTimestamp({time: {seconds: 100}})).toBe(100000);
  expect(homeTimestamp({time: {toMillis: () => 1234}})).toBe(1234);
  expect(homeTimestamp({createdAt: 'bad', time: {seconds: 100}})).toBe(100000);
  expect(homeTimestamp({createdAt: '2026-01-01T00:00:00Z'})).toBe(
    Date.parse('2026-01-01T00:00:00Z'),
  );
  expect(homeTimestamp({})).toBe(0);
});
test('discount sections split 20-39% and 40%+ without overlap, skip inactive and duplicates', () => {
  const pct = (b: any) => b.pct;
  const brands = [
    {id: 'a', nameEng: 'A', pct: 20},
    {id: 'b', nameEng: 'B', pct: 39},
    {id: 'c', nameEng: 'C', pct: 40},
    {id: 'd', nameEng: 'D', pct: 70},
    {id: 'e', nameEng: 'E', pct: 19},
    {id: 'f', nameEng: 'F', pct: 50, status: 'Expired'},
    {id: 'g', nameEng: 'd ', pct: 45},
  ];
  expect(discountDeals(brands, pct, 40).map(b => b.id)).toEqual(['d', 'c']);
  expect(discountDeals(brands, pct, 20, 40).map(b => b.id)).toEqual(['b', 'a']);
});
test('chunk, event date and time-ago helpers', () => {
  expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  expect(eventTimestamp({date: {seconds: 5}, createdAt: {seconds: 9}})).toBe(5000);
  const now = Date.parse('2026-10-13T12:00:00Z');
  expect(timeAgo(now - 3 * 86400000, false, now)).toBe('3 days ago');
  expect(timeAgo(now, false, now)).toBe('Today');
  expect(timeAgo(now - 20 * 86400000, false, now)).toBe('2 weeks ago');
  expect(timeAgo(now - 400 * 86400000, false, now)).toBe('');
  expect(timeAgo(0, false, now)).toBe('');
});
