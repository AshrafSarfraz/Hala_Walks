import {PermissionsAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {check, request} from 'react-native-permissions';
import {
  attachPermissionHost,
  ensurePermission,
  finishPermissionPrompt,
  permissionStatus,
  requestNativePermission,
} from '../src/halabsaudi/permissions/service';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    getNotificationSettings: jest.fn(async () => ({authorizationStatus: -1})),
    requestPermission: jest.fn(async () => ({authorizationStatus: 1})),
  },
  AuthorizationStatus: {AUTHORIZED: 1, DENIED: 0},
}));
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
  Object.defineProperty(Platform, 'Version', {value: 33, configurable: true});
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
  (jest.spyOn(PermissionsAndroid, 'requestMultiple') as jest.Mock).mockResolvedValue({});
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});
test('a passive location check never requests permission', async () => {
  expect(await permissionStatus('location')).toBe('denied');
  expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});
test('approximate location counts as access', async () => {
  (PermissionsAndroid.check as jest.Mock).mockImplementation(
    async permission =>
      permission === PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );
  expect(await permissionStatus('location')).toBe('granted');
});
test('denied or blocked native location never gets saved as granted', async () => {
  (PermissionsAndroid.requestMultiple as jest.Mock).mockResolvedValue({
    [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: 'never_ask_again',
    [PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION]: 'denied',
  });
  expect(await requestNativePermission('location')).toBe('blocked');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    'hala_location_blocked',
    'true',
  );
});
test('concurrent location callers share one explanation and receive the skip result', async () => {
  const prompts = jest.fn();
  const detach = attachPermissionHost(prompts);
  const first = ensurePermission('location');
  const second = ensurePermission('location');
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(prompts).toHaveBeenCalledTimes(1);
  finishPermissionPrompt(false);
  expect(await first).toBe(false);
  expect(await second).toBe(false);
  expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
  detach();
});
test('unmount cancels pending prompts rather than leaving a caller waiting', async () => {
  const detach = attachPermissionHost(jest.fn());
  const pending = ensurePermission('location');
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  detach();
  expect(await pending).toBe(false);
});
test('iOS location actually checks and requests its handler', async () => {
  Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
  (check as jest.Mock).mockResolvedValue('denied');
  (request as jest.Mock).mockResolvedValue('granted');
  expect(await requestNativePermission('location')).toBe('granted');
  expect(request).toHaveBeenCalledWith('ios.permission.LOCATION_WHEN_IN_USE');
});
test('Android 11+ background access directs to Settings without opening another runtime prompt', async () => {
  expect(await requestNativePermission('backgroundLocation')).toBe('blocked');
  expect(request).not.toHaveBeenCalled();
  expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
});
