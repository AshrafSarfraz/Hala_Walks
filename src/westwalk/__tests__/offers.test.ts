import {
  percentValue,
  offerRows,
  getDiscountPercent,
  discountLabel,
  galleryImages,
  validRedeemPin,
  sanitizePin,
  createdAtMs,
} from '../utils/offers';
describe('Westwalk offer presentation and six-digit PIN', () => {
  test('accepts exactly six matching digits and preserves leading zeroes', () => {
    expect(validRedeemPin('012345', '012345')).toBe(true);
    expect(validRedeemPin('123456', 123456)).toBe(true);
    expect(validRedeemPin('12345', '12345')).toBe(false);
    expect(validRedeemPin('012345', 12345)).toBe(false);
    expect(validRedeemPin('123456', '123457')).toBe(false);
    expect(validRedeemPin('123456', null)).toBe(false);
    expect(validRedeemPin('1234567', '1234567')).toBe(false);
    expect(sanitizePin('01a23-45678')).toBe('012345');
  });
  test('keeps each structured discount value for its own redemption row', () => {
    const item = {
      discount: 99,
      discounts: [
        {value: 37, descriptionEng: '% Discount'},
        {value: '25%', descriptionEng: '% Discount'},
      ],
    };
    const rows = offerRows(item);
    expect(rows.map(r => r.value)).toEqual(['37', '25%']);
    expect(discountLabel(rows[0], false)).toBe('37 % Discount');
    expect(discountLabel(rows[1], false)).toBe('25% Discount');
    expect(getDiscountPercent(item)).toBe(37);
  });
  test('shows only true percentage values in 20 percent plus deals', () => {
    expect(getDiscountPercent({discount: 'Flat 25% OFF'})).toBe(25);
    expect(getDiscountPercent({discount: 19})).toBeLessThan(20);
    expect(
      getDiscountPercent({discounts: [{value: 50, descriptionEng: 'QAR off'}]}),
    ).toBe(0);
    expect(getDiscountPercent({discount: 'Buy 1 get 1'})).toBe(0);
    expect(percentValue(200)).toBe(0);
    expect(percentValue(true)).toBe(0);
  });
  test('supports the existing single offer schema without inventing discounts', () => {
    expect(offerRows({discount: '20'})[0].percent).toBe(20);
    expect(offerRows({percentage: '30%'})[0].value).toBe('30%');
    expect(offerRows({})).toEqual([]);
  });
  test('supports both Westwalk and HBS image fields with a single-image fallback', () => {
    const first = 'https://example.com/first.png';
    const second = 'https://example.com/second.png';
    expect(
      galleryImages({
        multiImages: [first, first, ''],
        multiImageUrls: [second],
      }),
    ).toEqual([second, first]);
    expect(galleryImages({img: first})).toEqual([first]);
    expect(galleryImages({img: null})).toEqual([]);
  });
  test('reads timestamps from fresh Firestore and serialized offline cache', () => {
    expect(createdAtMs({time: {seconds: 100}})).toBe(100000);
    expect(createdAtMs({time: {toMillis: () => 123}})).toBe(123);
    expect(createdAtMs({createdAt: 'invalid'})).toBe(0);
  });
});
