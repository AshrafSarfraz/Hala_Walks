import React from 'react';
import {StyleSheet, Text as NativeText, TouchableOpacity} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AuthLayout from '../components/AuthLayout';
import ScreenHeader from '../components/header/ScreenHeader';
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, bottom: 20, left: 0, right: 0}),
}));
jest.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({language: {language: 'en'}}),
}));
jest.mock('@react-native-vector-icons/ionicons', () => () => null);
test('authentication header has a real title, compact row and one safe-area inset', async () => {
  const back = jest.fn();
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <AuthLayout title="Staff Login" onBackPress={back}>
        <NativeText>Credentials</NativeText>
      </AuthLayout>,
    );
  });
  const header = tree.root.findByProps({testID: 'westwalk-header'});
  const safeArea = tree.root.findByProps({testID: 'westwalk-header-safe-area'});
  expect(StyleSheet.flatten(header.props.style)).toEqual(
    expect.objectContaining({
      height: 56,
      borderRadius: 0,
      width: '100%',
      backgroundColor: '#FFFFFF',
    }),
  );
  expect(StyleSheet.flatten(safeArea.props.style).paddingTop).toBe(24);
  expect(
    tree.root.findByProps({accessibilityRole: 'header'}).props.children,
  ).toBe('Staff Login');
  await act(async () => tree.root.findByType(TouchableOpacity).props.onPress());
  expect(back).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
test('top-level header does not reserve a blank back button', async () => {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<ScreenHeader title="Wishlist" />);
  });
  expect(tree.root.findAllByType(TouchableOpacity)).toHaveLength(0);
  expect(
    tree.root.findByProps({accessibilityRole: 'header'}).props.children,
  ).toBe('Wishlist');
  await act(async () => tree.unmount());
});
