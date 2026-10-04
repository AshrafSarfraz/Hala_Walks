import {Platform, PermissionsAndroid} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  PermissionStatus,
  openSettings,
} from 'react-native-permissions';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PermissionKind =
  | 'location'
  | 'notifications'
  | 'camera'
  | 'backgroundLocation';
export type AccessStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';
const mapStatus = (status: PermissionStatus): AccessStatus =>
  status === RESULTS.GRANTED || status === RESULTS.LIMITED ? 'granted' : status;
export async function permissionStatus(
  kind: PermissionKind,
): Promise<AccessStatus> {
  if (kind === 'backgroundLocation') {
    if (Platform.OS === 'ios') {
      return mapStatus(await check(PERMISSIONS.IOS.LOCATION_ALWAYS));
    }
    if (Number(Platform.Version) < 29) {
      return permissionStatus('location');
    }
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    );
    // Android 11+ exposes 'Allow all the time' on the app settings page only.
    return granted
      ? 'granted'
      : Number(Platform.Version) >= 30
      ? 'blocked'
      : 'denied';
  }
  if (kind === 'notifications') {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED
      ? 'granted'
      : settings.authorizationStatus === AuthorizationStatus.DENIED
      ? 'denied'
      : 'denied';
  }
  if (Platform.OS === 'android' && kind === 'location') {
    const fine = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    const coarse = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    );
    if (fine || coarse) {
      return 'granted';
    }
    return (await AsyncStorage.getItem('hala_location_blocked')) === 'true'
      ? 'blocked'
      : 'denied';
  }
  return mapStatus(
    await check(
      kind === 'camera'
        ? Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ),
  );
}
export async function requestNativePermission(
  kind: PermissionKind,
): Promise<AccessStatus> {
  const existing = await permissionStatus(kind);
  if (
    existing === 'granted' ||
    existing === 'unavailable' ||
    existing === 'blocked'
  ) {
    return existing;
  }
  if (kind === 'backgroundLocation') {
    if ((await permissionStatus('location')) !== 'granted') {
      return 'denied';
    }
    return mapStatus(
      await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_ALWAYS
          : PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      ),
    );
  }
  if (kind === 'notifications') {
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED
        ? 'granted'
        : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ? 'blocked'
        : 'denied';
    }
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED
      ? 'granted'
      : 'blocked';
  }
  if (kind === 'location' && Platform.OS === 'android') {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    const granted = Object.values(result).includes(
      PermissionsAndroid.RESULTS.GRANTED,
    );
    const blocked =
      !granted &&
      Object.values(result).includes(
        PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      );
    await AsyncStorage.setItem('hala_location_blocked', String(blocked));
    return granted ? 'granted' : blocked ? 'blocked' : 'denied';
  }
  return mapStatus(
    await request(
      kind === 'camera'
        ? Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ),
  );
}
export const openPermissionSettings = () => openSettings('application');

// Serialize contextual explanations: concurrent callers share one prompt per permission.
type Prompt = {kind: PermissionKind; resolve: (allowed: boolean) => void};
let host: ((prompt: Prompt | null) => void) | null = null;
const queue: Prompt[] = [];
const pending = new Map<PermissionKind, Promise<boolean>>();
export function attachPermissionHost(
  callback: (prompt: Prompt | null) => void,
) {
  host = callback;
  if (queue[0]) {
    callback(queue[0]);
  }
  return () => {
    host = null;
    queue.splice(0).forEach(prompt => prompt.resolve(false));
  };
}
export function finishPermissionPrompt(allowed: boolean) {
  queue.shift()?.resolve(allowed);
  host?.(queue[0] ?? null);
}
export async function ensurePermission(kind: PermissionKind): Promise<boolean> {
  if ((await permissionStatus(kind)) === 'granted') {
    return true;
  }
  const existing = pending.get(kind);
  if (existing) {
    return existing;
  }
  if (!host) {
    return false;
  }
  const promise = new Promise<boolean>(resolve => {
    queue.push({kind, resolve});
    if (queue.length === 1) {
      host?.(queue[0]);
    }
  });
  pending.set(kind, promise);
  try {
    return await promise;
  } finally {
    pending.delete(kind);
  }
}
