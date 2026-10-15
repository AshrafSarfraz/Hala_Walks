// Brand ki card / list image choose karne ka helper.
// Order: gallery (multiImageUrls / multiImages) ki pehli image -> heroImage -> logo (img).
// Fields wahi hain jo utils/offers.ts ka galleryImages() (detail screen) use karta hai.

const isUrl = (v: string) => /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(v);

const clean = (v: any): string => {
  let s = '';
  if (typeof v === 'string') s = v.trim();
  else if (v && typeof v === 'object') {
    s = String(v.url || v.uri || v.secure_url || '').trim();
  }
  return s && isUrl(s) ? s : '';
};

export const brandLogo = (b: any): string => clean(b?.img) || clean(b?.logo);

export const brandPhotos = (b: any): string[] => {
  const logo = brandLogo(b);
  const out: string[] = [];
  const seen = new Set<string>();
  [b?.multiImageUrls, b?.multiImages, b?.imageUrls, b?.images].forEach(list => {
    if (!Array.isArray(list)) return;
    list.forEach(entry => {
      const u = clean(entry);
      if (!u || u === logo || seen.has(u)) return;
      seen.add(u);
      out.push(u);
    });
  });
  return out;
};

/** Pehli gallery image, warna heroImage, warna logo. */
export const brandCoverUri = (b: any): string =>
  brandPhotos(b)[0] || clean(b?.heroImage) || brandLogo(b);

/** true jab card par logo hi dikhega (koi photo nahi). */
export const brandCoverIsLogo = (b: any): boolean =>
  !brandPhotos(b)[0] && !clean(b?.heroImage);

/**
 * CachedImage ke liye ready props:
 *   <CachedImage {...brandImageProps(item)} style={...} />
 * Photo -> 'cover' (card bhar de), logo -> logoResizeMode (default 'contain', kate nahi).
 * Photo load fail ho to CachedImage khud logo (fallbackUri) dikha deta hai.
 */
export const brandImageProps = (
  b: any,
  logoResizeMode: 'cover' | 'contain' = 'contain',
) => {
  const logo = brandLogo(b);
  const uri = brandCoverUri(b);
  const isLogo = !uri || uri === logo;
  return {
    uri,
    resizeMode: isLogo ? logoResizeMode : ('cover' as const),
    fallbackUri: isLogo ? undefined : logo || undefined,
    fallbackResizeMode: logoResizeMode,
  };
};
