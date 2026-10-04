/** Preserve gallery order, omit blanks/invalid URIs and duplicate photographs. */
export function uniqueImageUrls(values: unknown[]): string[] {
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim())
        .filter(value => /^https?:\/\//i.test(value)),
    ),
  ];
}
export function brandGallery(item: any): string[] {
  const gallery = uniqueImageUrls([
    item?.heroImage,
    ...(Array.isArray(item?.multiImageUrls) ? item.multiImageUrls : []),
  ]);
  return gallery.length ? gallery : uniqueImageUrls([item?.img]);
}
