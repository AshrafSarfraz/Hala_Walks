import {unwrapMessages} from '../api/unwrap';
/** FlatList is inverted: index zero must always be the newest message. */
export function mergeMessages<T extends {_id: string; tempId?: string; createdAt: Date | string}>(items: T[]): T[] {
  const ids = new Set<string>();
  const tempIds = new Set<string>();
  return items.filter(item => {
    if (ids.has(String(item._id)) || (item.tempId && tempIds.has(item.tempId))) return false;
    ids.add(String(item._id));
    if (item.tempId) tempIds.add(item.tempId);
    return true;
  }).sort((a, b) => {
    const time = (value: Date | string) => new Date(value).getTime() || 0;
    return time(b.createdAt) - time(a.createdAt) || String(b._id).localeCompare(String(a._id));
  });
}
export function messagePage(data: any, limit = 20) {
  const messages = unwrapMessages(data);
  const meta = data?.pagination || data?.data?.pagination || data;
  return {messages, nextCursor: meta?.nextCursor ?? null, hasMore: typeof meta?.hasMore === 'boolean' ? meta.hasMore : messages.length >= limit};
}
export function dateLabel(date: Date | string, locale = 'en', now = new Date()) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (value.toDateString() === now.toDateString()) return locale === 'ar' ? 'اليوم' : 'Today';
  if (value.toDateString() === yesterday.toDateString()) return locale === 'ar' ? 'أمس' : 'Yesterday';
  return value.toLocaleDateString(locale, {day: 'numeric', month: 'short', year: value.getFullYear() === now.getFullYear() ? undefined : 'numeric'});
}
