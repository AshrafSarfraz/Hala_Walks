import {Platform, PermissionsAndroid} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
export type LocationAccess = {
  foreground: boolean;
  background: boolean;
  blocked: boolean;
};
export async function readLocationAccess(): Promise<LocationAccess> {
  if (Platform.OS === 'android') {
    const foreground =
      (await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      )) ||
      (await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ));
    const background =
      foreground &&
      (Number(Platform.Version) < 29 ||
        (await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        )));
    return {foreground, background, blocked: false};
  }
  const [foreground, background] = await Promise.all([
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE),
    check(PERMISSIONS.IOS.LOCATION_ALWAYS),
  ]);
  return {
    foreground:
      foreground === RESULTS.GRANTED || background === RESULTS.GRANTED,
    background: background === RESULTS.GRANTED,
    blocked: foreground === RESULTS.BLOCKED,
  };
}
export async function requestForegroundLocation(): Promise<LocationAccess> {
  const existing = await readLocationAccess();
  if (existing.foreground) return existing;
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    const access = await readLocationAccess();
    return {
      ...access,
      blocked:
        !access.foreground &&
        Object.values(result).some(
          value => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        ),
    };
  }
  const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  return {...(await readLocationAccess()), blocked: result === RESULTS.BLOCKED};
}
export async function requestBackgroundLocation(): Promise<LocationAccess> {
  const access = await readLocationAccess();
  if (!access.foreground || access.background) return access;
  if (Platform.OS === 'android') {
    // Android 11+ grants this only through the OS permission settings screen.
    if (Number(Platform.Version) >= 30) await openSettings('application');
    else if (Number(Platform.Version) >= 29)
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );
  } else {
    await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
  }
  return readLocationAccess();
}
