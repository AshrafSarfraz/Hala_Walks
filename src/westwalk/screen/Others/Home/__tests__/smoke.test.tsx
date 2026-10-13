import React from 'react';
import renderer, {act} from 'react-test-renderer';
import Home from '..';
let mockLang = 'en';
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({top: 0, bottom: 0})}), {virtual: true});
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
  useFocusEffect: (cb: any) => require('react').useEffect(cb, [cb]),
}));
jest.mock('react-redux', () => ({useSelector: (s: any) => s({language: {language: mockLang}})}));
jest.mock('@react-native-async-storage/async-storage', () => ({getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined)}));
jest.mock('@react-native-vector-icons/ionicons', () => () => null);
jest.mock('../../../../firebase/firebaseconfig', () => ({firestore: () => ({collection: () => ({get: () => Promise.resolve({docs: []})})})}));
jest.mock('../../../../firebase/firebaseutils', () => ({fetchFlatOfferFromFirebase: () => Promise.resolve([{id: 'o1', img: 'x'}, {id: 'o2', img: 'y'}])}));
jest.mock('../../../../utils/offers', () => ({getDiscountPercent: (b: any) => b.pct || 0}));
jest.mock('../../../../hooks/useBrandCatalog', () => ({
  __esModule: true,
  refreshBrandCatalog: jest.fn(),
  default: () => ({loading: false, error: null, brands: Array.from({length: 12}, (_, i) => ({
    id: 'b' + i, nameEng: 'Brand ' + i, nameArabic: 'ع' + i, pct: [10, 25, 35, 45, 60][i % 5],
    isBestSeller: i % 3 === 0, selectedCategory: 'Food', time: {seconds: 1700000000 + i * 1000},
  }))}),
}));
jest.mock('../Categories', () => () => null);
const textOf = (t: renderer.ReactTestRenderer) => t.root.findAll(n => typeof n.type === 'string').flatMap(n => n.children.filter(c => typeof c === 'string')).join('');
for (const l of ['en', 'ar'])
  test('home renders all sections in ' + l, async () => {
    mockLang = l;
    jest.useFakeTimers();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<Home navigation={{navigate: jest.fn()}} />); });
    const json = textOf(tree);
    const want = l === 'en'
      ? ['Hot Deals', '20% – 39% OFF', 'Best Sellers', 'Recently Added', 'Events are coming soon', 'Featured Offers', '1 / 2', '#1', 'NEW', '35% OFF']
      : ['عروض نارية', 'الأكثر مبيعًا', 'أضيف حديثًا', 'الفعاليات قادمة قريبًا', 'جديد'];
    for (const w of want) expect(json).toContain(w);
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(textOf(tree)).toContain('/ 2');
    await act(async () => tree.unmount());
    jest.useRealTimers();
  });
