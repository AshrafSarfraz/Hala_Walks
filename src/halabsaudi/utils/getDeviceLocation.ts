// import {Platform, PermissionsAndroid} from 'react-native';
// import Geolocation from '@react-native-community/geolocation';
// import BackgroundGeolocation from 'react-native-background-geolocation';

// export type DeviceCoords = {
//   latitude: number;
//   longitude: number;
// };

// const communityGetPosition = (options: {
//   enableHighAccuracy: boolean;
//   timeout: number;
//   maximumAge: number;
// }): Promise<DeviceCoords> =>
//   new Promise((resolve, reject) => {
//     Geolocation.getCurrentPosition(
//       pos =>
//         resolve({
//           latitude: pos.coords.latitude,
//           longitude: pos.coords.longitude,
//         }),
//       reject,
//       options,
//     );
//   });

// export async function ensureLocationPermission(): Promise<boolean> {
//   if (Platform.OS === 'android') {
//     const fine = await PermissionsAndroid.check(
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//     );
//     const coarse = await PermissionsAndroid.check(
//       PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//     );
//     if (fine || coarse) {
//       return true;
//     }

//     const granted = await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//       PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//     ]);

//     return (
//       granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
//         PermissionsAndroid.RESULTS.GRANTED ||
//       granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
//         PermissionsAndroid.RESULTS.GRANTED
//     );
//   }

//   Geolocation.requestAuthorization();
//   return true;
// }

// /**
//  * Resolves device coordinates without fighting the notification background tracker.
//  *
//  * Order:
//  * 1. react-native-background-geolocation (already running for venue alerts)
//  * 2. Fast/cached fix via community geolocation (network / last known)
//  * 3. High-accuracy GPS as last resort
//  */
// export async function getDeviceLocation(): Promise<DeviceCoords> {
//   const hasPermission = await ensureLocationPermission();
//   if (!hasPermission) {
//     throw Object.assign(new Error('Location permission denied'), {code: 1});
//   }

//   try {
//     const loc = await BackgroundGeolocation.getCurrentPosition({
//       timeout: 20,
//       samples: 1,
//       persist: false,
//       maximumAge: 120000,
//     });
//     return {
//       latitude: loc.coords.latitude,
//       longitude: loc.coords.longitude,
//     };
//   } catch (e) {
//     console.log('[getDeviceLocation] background-geolocation:', e);
//   }

//   try {
//     return await communityGetPosition({
//       enableHighAccuracy: false,
//       timeout: 12000,
//       maximumAge: 300000,
//     });
//   } catch (e) {
//     console.log('[getDeviceLocation] cached/network:', e);
//   }

//   return communityGetPosition({
//     enableHighAccuracy: true,
//     timeout: 30000,
//     maximumAge: 600000,
//   });
// }



import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundGeolocation from 'react-native-background-geolocation';

export type DeviceCoords = {
  latitude: number;
  longitude: number;
};

const communityGetPosition = (options: {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}): Promise<DeviceCoords> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      reject,
      options,
    );
  });

export async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const fine = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    const coarse = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    );
    if (fine || coarse) {
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    return (
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  }

  Geolocation.requestAuthorization();
  return true;
}

/**
 * Resolves device coordinates.
 *
 * Order:
 * 1. BackgroundGeolocation (already running — fastest if plugin is active)
 * 2. Fast cached/network fix via community geolocation
 * 3. High-accuracy GPS as last resort
 *
 * All three are raced against a hard 8-second deadline so the map never
 * blocks waiting for a slow GPS cold-start. MapView's onUserLocationChange
 * will deliver the accurate position once GPS acquires in the background.
 */
export async function getDeviceLocation(): Promise<DeviceCoords> {
  const hasPermission = await ensureLocationPermission();
  if (!hasPermission) {
    throw Object.assign(new Error('Location permission denied'), {code: 1});
  }

  // Hard deadline — if nothing resolves in 8 s, throw so the caller can
  // fall back immediately instead of blocking the UI.
  const deadline = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          Object.assign(new Error('Location request timed out'), {code: 3}),
        ),
      8000,
    ),
  );

  const attempts = (async (): Promise<DeviceCoords> => {
    // iOS simulator: BackgroundGeolocation often returns stale/wrong coords.
    // Prefer community geolocation first so MapView's blue dot stays accurate.
    if (Platform.OS !== 'ios') {
      try {
        const loc = await BackgroundGeolocation.getCurrentPosition({
          timeout: 5,
          samples: 1,
          persist: false,
          maximumAge: 120000,
        });
        return {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      } catch (e) {
        console.log('[getDeviceLocation] background-geolocation failed:', e);
      }
    }

    // Network/cached fix — fast, no GPS cold-start needed
    try {
      return await communityGetPosition({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      });
    } catch (e) {
      console.log('[getDeviceLocation] network fix failed:', e);
    }

    // High-accuracy GPS as last resort
    return communityGetPosition({
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 60000,
    });
  })();

  // Whichever settles first wins — location or the 8s deadline
  return Promise.race([attempts, deadline]);
}