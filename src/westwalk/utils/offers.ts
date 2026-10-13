export type OfferRow = {
  key: string;
  value: string;
  percent: number;
  descriptionEng: string;
  descriptionArabic: string;
  pin?: unknown;
};
export function percentValue(value: unknown): number {
  if (typeof value !== 'number' && typeof value !== 'string') return 0;
  const text = String(value).trim();
  const match =
    text.match(/^(\d+(?:\.\d+)?)\s*%?$/) || text.match(/(\d+(?:\.\d+)?)\s*%/);
  const n = match ? Number(match[1]) : 0;
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : 0;
}
export function offerRows(item: any): OfferRow[] {
  if (Array.isArray(item?.discounts) && item.discounts.length) {
    return item.discounts
      .filter((d: any) => d && d.value != null && String(d.value).trim())
      .map((d: any, index: number) => {
        const value = String(d.value).trim();
        const descriptionEng = String(d.descriptionEng || '% Discount');
        const descriptionArabic = String(
          d.descriptionArabic || d.descriptionEng || '% خصم',
        );
        const isAmount = /\b(QAR|QR|AED|SAR|KD|BHD|OMR)\b|ريال|درهم/i.test(
          descriptionEng + ' ' + descriptionArabic,
        );
        return {
          key: String(d.id ?? index),
          value,
          percent: isAmount ? 0 : percentValue(value),
          descriptionEng,
          descriptionArabic,
          pin: d.pin,
        };
      });
  }
  if (item?.isLimited)
    return [
      {
        key: 'limited',
        value: String(item.isLimited),
        percent: 0,
        descriptionEng: '',
        descriptionArabic: '',
      },
    ];
  const value =
    item?.discount ??
    item?.percentage ??
    item?.discountPercentage ??
    item?.discountPercent;
  const percent = percentValue(value);
  return value == null || String(value).trim() === ''
    ? []
    : [
        {
          key: 'legacy',
          value: String(value),
          percent,
          descriptionEng: percent ? '% Discount' : '',
          descriptionArabic: percent ? '% خصم' : '',
        },
      ];
}
export function discountLabel(row: OfferRow, ar: boolean): string {
  const desc = ar ? row.descriptionArabic : row.descriptionEng;
  return `${row.value}${
    row.value.includes('%') && desc.startsWith('%') ? desc.slice(1) : ' ' + desc
  }`.trim();
}
export function getDiscountPercent(item: any): number {
  const rows = offerRows(item);
  const values = rows.map(row => row.percent);
  // Structured discount rows are authoritative when present.
  if (Array.isArray(item?.discounts) && item.discounts.length)
    return Math.max(0, ...values);
  return Math.max(
    0,
    ...values,
    ...[
      'discountPercentage',
      'discountPercent',
      'discount',
      'offerPercentage',
      'offerPercent',
      'percentage',
      'offer',
      'offerText',
      'offerEng',
    ].map(key => percentValue(item?.[key])),
  );
}
export function galleryImages(item: any): string[] {
  const entries = [
    item?.heroImage,
    ...(Array.isArray(item?.multiImageUrls) ? item.multiImageUrls : []),
    ...(Array.isArray(item?.multiImages) ? item.multiImages : []),
  ];
  const urls = entries
    .filter(
      (v): v is string =>
        typeof v === 'string' && /^https?:\/\//i.test(v.trim()),
    )
    .map(v => v.trim());
  if (
    !urls.length &&
    typeof item?.img === 'string' &&
    /^https?:\/\//i.test(item.img.trim())
  )
    urls.push(item.img.trim());
  return [...new Set(urls)];
}
export const sanitizePin = (input: string) =>
  input.replace(/[^0-9]/g, '').slice(0, 6);
export function validRedeemPin(entered: string, expected: unknown): boolean {
  const target =
    typeof expected === 'string' || typeof expected === 'number'
      ? String(expected).trim()
      : '';
  return (
    /^\d{6}$/.test(entered) && /^\d{6}$/.test(target) && entered === target
  );
}
export function createdAtMs(item: any): number {
  const v = item?.time ?? item?.createdAt;
  if (typeof v?.toMillis === 'function') return v.toMillis();
  if (typeof v?.seconds === 'number') return v.seconds * 1000;
  if (typeof v?._seconds === 'number') return v._seconds * 1000;
  const timestamp = typeof v === 'number' ? v : Date.parse(String(v || ''));
  return Number.isFinite(timestamp) ? timestamp : 0;
}
