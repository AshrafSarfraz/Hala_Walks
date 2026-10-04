export const normalizeCatalogText = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
export function recentBrands(items: any[], country: string, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return items
    .filter(item => {
      const created = new Date(
        item.createdAt || item.created_at || item.time,
      ).getTime();
      return (
        normalizeCatalogText(item.status) === 'active' &&
        normalizeCatalogText(item.selectedCountry) ===
          normalizeCatalogText(country) &&
        Number.isFinite(created) &&
        created >= cutoff.getTime() &&
        created <= now.getTime()
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.created_at || b.time).getTime() -
        new Date(a.createdAt || a.created_at || a.time).getTime(),
    );
}
export function maxPercentageOffer(brand: any): number {
  if (brand.isFlatOffer === true || brand.isFlatOffer === 'true') return 0;
  const discounts = Array.isArray(brand.discounts) ? brand.discounts : [];
  return discounts.reduce((maximum: number, discount: any) => {
    const raw = String(discount?.value ?? '').trim();
    if (!/^\d+(?:\.\d+)?\s*%?$/.test(raw)) return maximum;
    const value = Number(raw.replace('%', '').trim());
    return value > 0 && value <= 100 ? Math.max(maximum, value) : maximum;
  }, 0);
}
export function highOfferBrands(items: any[], country: string, minimum = 20) {
  return items
    .filter(
      item =>
        normalizeCatalogText(item.status) === 'active' &&
        normalizeCatalogText(item.selectedCountry) ===
          normalizeCatalogText(country) &&
        maxPercentageOffer(item) >= minimum,
    )
    .sort((a, b) => maxPercentageOffer(b) - maxPercentageOffer(a));
}
