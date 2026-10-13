import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FlatList} from 'react-native';
import EventSlider from '../Events';
const mockGet = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: any) =>
    require('react').useEffect(callback, [callback]),
}));
jest.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({language: {language: 'en'}}),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../../firebase/firebaseconfig', () => ({
  firestore: () => ({collection: () => ({get: mockGet})}),
}));
jest.mock('../../../../components/Media/CachedImage', () => () => null);
jest.mock('@react-native-vector-icons/ionicons', () => () => null);
beforeEach(() => jest.clearAllMocks());
test('existing events render and pull-refresh key fetches new events', async () => {
  mockGet.mockResolvedValue({
    docs: [{id: 'event', data: () => ({nameEng: 'Event'})}],
  });
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <EventSlider navigation={{navigate: jest.fn()}} refreshKey={0} />,
    );
  });
  expect(tree.root.findByType(FlatList).props.data).toEqual([
    {id: 'event', nameEng: 'Event'},
  ]);
  await act(async () => {
    tree.update(
      <EventSlider navigation={{navigate: jest.fn()}} refreshKey={1} />,
    );
  });
  expect(mockGet).toHaveBeenCalledTimes(2);
  await act(async () => tree.unmount());
});
test('no events shows a coming-soon card; failed fetch shows retry', async () => {
  mockGet.mockResolvedValueOnce({docs: []});
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<EventSlider navigation={{}} />);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Events are coming soon');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Tap to retry');
  mockGet.mockRejectedValueOnce(new Error('network'));
  await act(async () => {
    tree.update(<EventSlider navigation={{}} refreshKey={1} />);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Tap to retry');
  expect(JSON.stringify(tree.toJSON())).toContain('Events are coming soon');
  await act(async () => tree.unmount());
});
