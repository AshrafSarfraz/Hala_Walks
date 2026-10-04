import {
  brandGallery,
  uniqueImageUrls,
} from '../src/halabsaudi/Component/Media/gallery';
test('gallery removes duplicates, blanks and invalid URLs without reordering photographs', () => {
  expect(
    uniqueImageUrls([
      ' https://photo/a ',
      '',
      'https://photo/a',
      null,
      'file:///x',
      'https://photo/b',
    ]),
  ).toEqual(['https://photo/a', 'https://photo/b']);
});
test('official photos take priority over logos', () => {
  expect(
    brandGallery({
      heroImage: 'https://photo/a',
      multiImageUrls: ['https://photo/a', 'https://photo/b'],
      img: 'https://logo/a',
    }),
  ).toEqual(['https://photo/a', 'https://photo/b']);
  expect(brandGallery({img: 'https://logo/a'})).toEqual(['https://logo/a']);
  expect(brandGallery({})).toEqual([]);
});
