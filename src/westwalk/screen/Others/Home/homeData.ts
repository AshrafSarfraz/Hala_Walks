const CREATED_KEYS = ['createdAt', 'created_at', 'time', 'addedAt'];
const EVENT_KEYS = ['date', 'eventDate', 'startDate', 'start_date', 'from'];
const INACTIVE = ['inactive', 'in-active', 'expired', 'disabled'];

export function homeTimestamp(item: any, keys: string[] = CREATED_KEYS): number {
  for (const key of keys) {
    const value = item?.[key];
    if (value == null) continue;
    let timestamp = 0;
    if (typeof value?.toMillis === 'function') timestamp = value.toMillis();
    else if (typeof value?.toDate === 'function')
      timestamp = value.toDate().getTime();
    else if (typeof value?.seconds === 'number')
      timestamp = value.seconds * 1000;
    else if (typeof value?._seconds === 'number')
      timestamp = value._seconds * 1000;
    else if (typeof value === 'number')
      timestamp = value < 100000000000 ? value * 1000 : value;
    else timestamp = new Date(value).getTime();
    if (Number.isFinite(timestamp) && timestamp > 0) return timestamp;
  }
  return 0;
}

export function eventTimestamp(item: any): number {
  return homeTimestamp(item, EVENT_KEYS);
}

export function isBestSeller(item: any): boolean {
  const flag = item?.isBestSeller;
  return (
    flag === true ||
    flag === 1 ||
    (typeof flag === 'string' &&
      ['yes', 'true', '1'].includes(flag.trim().toLowerCase()))
  );
}

export function recentlyAdded(brands: any[]): any[] {
  // No month cutoff. Undated entries keep their source order after dated entries.
  return [...brands]
    .sort((a, b) => homeTimestamp(b) - homeTimestamp(a))
    .slice(0, 6);
}

export function isActiveBrand(item: any): boolean {
  return !INACTIVE.includes(String(item?.status || '').toLowerCase());
}

function uniqueByName(list: any[]): any[] {
  const seen = new Set<string>();
  return list.filter(b => {
    const key = String(b.nameEng || b.nameArabic || b.id)
      .trim()
      .toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Active brands whose discount is in [min, max), highest discount first,
 * one entry per brand name.
 */
export function discountDeals(
  brands: any[],
  percent: (item: any) => number,
  min: number,
  max = Infinity,
  limit = 15,
): any[] {
  const inRange = brands.filter(b => {
    const p = percent(b);
    return isActiveBrand(b) && p >= min && p < max;
  });
  inRange.sort((a, b) => percent(b) - percent(a));
  return uniqueByName(inRange).slice(0, limit);
}

/** Groups a list into columns of `size` (for two-row horizontal lists). */
export function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export function timeAgo(timestamp: number, ar: boolean, now = Date.now()): string {
  if (!timestamp) return '';
  const days = Math.floor((now - timestamp) / 86400000);
  if (days <= 0) return ar ? 'اليوم' : 'Today';
  if (days === 1) return ar ? 'أمس' : 'Yesterday';
  if (days < 7) return ar ? `منذ ${days} أيام` : `${days} days ago`;
  if (days > 60) return ''; // too old to call "recent"; hide the line
  const w = Math.floor(days / 7);
  if (w === 1) return ar ? 'منذ أسبوع' : '1 week ago';
  return ar ? `منذ ${w} أسابيع` : `${w} weeks ago`;
}
