// Brand ki list / card image choose karne ka helper.
// Order: gallery (multiImageUrls) ki pehli image -> heroImage -> logo (img).

const clean = (v: any): string => {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') {
    return String(v.url || v.uri || v.secure_url || '').trim();
  }
  return '';
};

export const brandLogo = (b: any): string => clean(b?.img) || clean(b?.logo);

export const brandPhotos = (b: any): string[] => {
  const logo = brandLogo(b);
  const out: string[] = [];
  const seen = new Set<string>();

  [b?.multiImageUrls, b?.imageUrls, b?.images].forEach(list => {
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

export type BrandCover = {
  uri: string; // jo dikhana hai
  isLogo: boolean; // true = logo hai (contain), false = photo (cover)
  fallback: string; // photo fail ho to ye (logo)
};

export const brandCover = (b: any): BrandCover => {
  const logo = brandLogo(b);
  const photo = brandPhotos(b)[0] || clean(b?.heroImage);

  if (photo && photo !== logo) {
    return {uri: photo, isLogo: false, fallback: logo};
  }
  return {uri: logo, isLogo: true, fallback: ''};
};

export const brandCoverUri = (b: any): string => brandCover(b).uri;
