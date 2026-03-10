import { Platform, PermissionsAndroid } from 'react-native';
import BackgroundGeolocation, {
  Location,
  State,
  Subscription,
  ProviderChangeEvent,
  MotionChangeEvent,
  HttpEvent,
  AuthorizationEvent,
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { navigate } from './RootNavigation';

const API_BASE = 'https://hala-b-saudi.onrender.com/api/hbs';

const VENUES_CACHE_KEY = 'H-venues_cache_v3';
const VENUE_RADIUS_METERS = 900;
const MAX_LOCATION_ACCURACY_METERS = 50;

// same venue ke liye repeatedly hit avoid karne ke liye
const LAST_HIT_VENUE_KEY = 'LAST_HIT_VENUE_KEY';
const LAST_HIT_TIME_KEY = 'LAST_HIT_TIME_KEY';
const SAME_VENUE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 30 min

let locationSub: Subscription | null = null;
let motionSub: Subscription | null = null;
let providerSub: Subscription | null = null;
let activitySub: Subscription | null = null;
let authorizationSub: Subscription | null = null;
let httpSub: Subscription | null = null;

let httpLock = false;

type SavedBackendUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
};

type VenueType = {
  _id?: string;
  id?: string;
  venueName?: string;
  venueNameAr?: string;
  latitude?: number | string;
  longitude?: number | string;
  city?: string;
  country?: string;
};

type CacheShape = {
  ts: number;
  data: VenueType[];
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function readCachedVenues(): Promise<VenueType[]> {
  try {
    const raw = await AsyncStorage.getItem(VENUES_CACHE_KEY);
    if (!raw) return [];

    const parsed: CacheShape = JSON.parse(raw);
    if (!parsed?.data || !Array.isArray(parsed.data)) return [];

    return parsed.data;
  } catch (error) {
    console.log('❌ readCachedVenues error:', error);
    return [];
  }
}

async function findNearbyVenue(
  userLat: number,
  userLng: number
): Promise<{ venue: VenueType | null; distance: number | null }> {
  try {
    const venues = await readCachedVenues();

    if (!venues.length) {
      console.log('⚠️ No cached venues found');
      return { venue: null, distance: null };
    }

    let nearestVenue: VenueType | null = null;
    let nearestDistance: number | null = null;

    for (const venue of venues) {
      const venueLat = Number(venue.latitude);
      const venueLng = Number(venue.longitude);

      if (!Number.isFinite(venueLat) || !Number.isFinite(venueLng)) {
        continue;
      }

      const distance = getDistanceInMeters(userLat, userLng, venueLat, venueLng);

      console.log(
        `📏 Venue ${venue.venueName || venue._id || venue.id} distance: ${Math.round(distance)}m`
      );

      if (distance <= VENUE_RADIUS_METERS) {
        if (nearestDistance === null || distance < nearestDistance) {
          nearestVenue = venue;
          nearestDistance = distance;
        }
      }
    }

    return {
      venue: nearestVenue,
      distance: nearestDistance,
    };
  } catch (error) {
    console.log('❌ findNearbyVenue error:', error);
    return { venue: null, distance: null };
  }
}

async function shouldHitForVenue(venueId: string) {
  try {
    const lastVenueId = await AsyncStorage.getItem(LAST_HIT_VENUE_KEY);
    const lastHitTimeRaw = await AsyncStorage.getItem(LAST_HIT_TIME_KEY);

    const lastHitTime = lastHitTimeRaw ? Number(lastHitTimeRaw) : 0;
    const now = Date.now();

    if (
      lastVenueId === venueId &&
      lastHitTime > 0 &&
      now - lastHitTime < SAME_VENUE_COOLDOWN_MS
    ) {
      console.log('⏳ Same nearby venue already hit recently, skipping API');
      return false;
    }

    return true;
  } catch (error) {
    console.log('❌ shouldHitForVenue error:', error);
    return true;
  }
}

async function markVenueHit(venueId: string) {
  try {
    await AsyncStorage.multiSet([
      [LAST_HIT_VENUE_KEY, venueId],
      [LAST_HIT_TIME_KEY, String(Date.now())],
    ]);
  } catch (error) {
    console.log('❌ markVenueHit error:', error);
  }
}

async function clearVenueHitState() {
  try {
    await AsyncStorage.multiRemove([LAST_HIT_VENUE_KEY, LAST_HIT_TIME_KEY]);
  } catch (error) {
    console.log('❌ clearVenueHitState error:', error);
  }
}

async function fetchVenueById(venueId: string) {
  try {
    const res = await fetch(`${API_BASE}/venues/${venueId}`);
    const json = await res.json().catch(() => ({}));
    return json?.data || null;
  } catch (e) {
    console.log('❌ fetchVenueById error:', e);
    return null;
  }
}

async function openFromData(data: any) {
  try {
    const screen = data?.screen;
    const venueId = data?.venueId;

    if (screen === 'SelectedVenue' && venueId) {
      const venue = await fetchVenueById(venueId);
      if (venue) {
        navigate('SelectedVenue', { item: venue });
      } else {
        navigate('Home');
      }
      return;
    }

    if (screen) {
      navigate(screen);
    }
  } catch (e) {
    console.log('❌ openFromData error:', e);
  }
}

async function getAuthData() {
  try {
    const userRaw = await AsyncStorage.getItem('hala_user_backend');

    if (!userRaw) {
      console.log('⚠️ No logged-in user found in storage');
      return { fcmToken: null, userId: null };
    }

    const user: SavedBackendUser = JSON.parse(userRaw);
    const userId = user?.id || null;

    if (!userId) {
      console.log('⚠️ User found but userId missing');
      return { fcmToken: null, userId: null };
    }

    const fcmToken = await messaging().getToken();

    return {
      fcmToken: fcmToken || null,
      userId,
    };
  } catch (error) {
    console.log('❌ getAuthData error:', error);
    return { fcmToken: null, userId: null };
  }
}

async function sendLocationToBackend(location: Location, nearbyVenue: VenueType) {
  if (httpLock) {
    console.log('⏳ Backend request skipped: previous request in progress');
    return;
  }

  httpLock = true;

  try {
    const { fcmToken, userId } = await getAuthData();

    // user login required
    if (!userId) {
      console.log('⛔ API blocked: user is not logged in');
      return;
    }

    if (!fcmToken) {
      console.log('⚠️ API blocked: FCM token missing');
      return;
    }

    const venueId = String(nearbyVenue._id || nearbyVenue.id || '');

    if (!venueId) {
      console.log('⚠️ Nearby venue found but venueId missing');
      return;
    }

    const canHit = await shouldHitForVenue(venueId);
    if (!canHit) return;

    const payload = {
      token: fcmToken,
      userLatitude: location.coords.latitude,
      userLongitude: location.coords.longitude,
      userId,
      venueId,
    };

    console.log('📤 sending payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE}/send-venue-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => ({}));
    console.log('📥 venue check response:', JSON.stringify(json, null, 2));

    if (response.ok) {
      await markVenueHit(venueId);
    }
  } catch (error) {
    console.log('❌ sendLocationToBackend error:', error);
  } finally {
    httpLock = false;
  }
}

function removeAllListeners() {
  if (locationSub) {
    locationSub.remove();
    locationSub = null;
  }
  if (motionSub) {
    motionSub.remove();
    motionSub = null;
  }
  if (providerSub) {
    providerSub.remove();
    providerSub = null;
  }
  if (activitySub) {
    activitySub.remove();
    activitySub = null;
  }
  if (authorizationSub) {
    authorizationSub.remove();
    authorizationSub = null;
  }
  if (httpSub) {
    httpSub.remove();
    httpSub = null;
  }
}

export async function initBackgroundVenueTracker() {
  try {
    removeAllListeners();

    locationSub = BackgroundGeolocation.onLocation(
      async (location: Location) => {
        try {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          const accuracy = location.coords.accuracy ?? 9999;

          console.log(
            `📍 onLocation => lat: ${lat}, lng: ${lng}, accuracy: ${accuracy}`
          );

          // low accuracy skip
          if (accuracy > MAX_LOCATION_ACCURACY_METERS) {
            console.log(`⚠️ Skipping location, accuracy too low: ${accuracy}m`);
            return;
          }

          // pehle login check
          const { userId } = await getAuthData();
          if (!userId) {
            console.log('⛔ User not logged in, skipping venue check');
            return;
          }

          const { venue, distance } = await findNearbyVenue(lat, lng);

          if (!venue) {
            console.log('ℹ️ No nearby venue found within 2000m');
            return;
          }

          console.log(
            `✅ Nearby venue found: ${venue.venueName} at ${Math.round(
              distance || 0
            )}m`
          );

          await sendLocationToBackend(location, venue);
        } catch (error) {
          console.log('❌ onLocation process error:', error);
        }
      },
      error => {
        console.log('❌ onLocation error:', JSON.stringify(error, null, 2));
      }
    );

    motionSub = BackgroundGeolocation.onMotionChange((event: MotionChangeEvent) => {
      console.log('🚶 motion change:', JSON.stringify(event, null, 2));
    });

    providerSub = BackgroundGeolocation.onProviderChange(
      (event: ProviderChangeEvent) => {
        console.log('📡 provider change:', JSON.stringify(event, null, 2));
      }
    );

    activitySub = BackgroundGeolocation.onActivityChange((event: any) => {
      console.log('🏃 activity change:', JSON.stringify(event, null, 2));
    });

    authorizationSub = BackgroundGeolocation.onAuthorization(
      (event: AuthorizationEvent) => {
        console.log('🔐 authorization event:', JSON.stringify(event, null, 2));
      }
    );

    httpSub = BackgroundGeolocation.onHttp((event: HttpEvent) => {
      console.log('🌐 http event:', JSON.stringify(event, null, 2));
    });

    const state: State = await BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 200,
      stopTimeout: 5,
      debug: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      foregroundService: true,
      allowsBackgroundLocationUpdates: true,
      pausesLocationUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      locationAuthorizationRequest: 'Always',
      disableMotionActivityUpdates: true,
    });

    console.log('✅ BG Geo ready, state:', JSON.stringify(state, null, 2));

    if (!state.enabled) {
      await BackgroundGeolocation.start();
      console.log('🚀 BackgroundGeolocation started');
    } else {
      console.log('ℹ️ BackgroundGeolocation already started');
    }
  } catch (error) {
    console.log('❌ initBackgroundVenueTracker error:', error);
  }
}

export async function stopBackgroundVenueTracker() {
  try {
    removeAllListeners();
    await BackgroundGeolocation.stop();
    console.log('🛑 BackgroundGeolocation stopped');
  } catch (error) {
    console.log('❌ stopBackgroundVenueTracker error:', error);
  }
}

export async function resetVenueNotificationState() {
  await clearVenueHitState();
}

const Notifications = async () => {
  try {
    if (Platform.OS === 'ios') {
      await messaging().requestPermission({
        provisional: true,
      });
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    const { userId } = await getAuthData();

    if (!userId) {
      console.log('⛔ Notifications token setup skipped: user not logged in');
      return;
    }

    const token = await messaging().getToken();
    console.log('🔔 FCM Token:', token);

    messaging().onNotificationOpenedApp(async remoteMessage => {
      await openFromData(remoteMessage?.data || {});
    });

    const initial = await messaging().getInitialNotification();
    if (initial?.data) {
      await openFromData(initial.data);
    }
  } catch (e) {
    console.log('❌ Notifications init error:', e);
  }
};

export default Notifications;



























// import { Platform, PermissionsAndroid } from 'react-native';
// import BackgroundGeolocation, {
//   Location,
//   State,
//   Subscription,
//   ProviderChangeEvent,
//   MotionChangeEvent,
//   HttpEvent,
//   AuthorizationEvent,
// } from 'react-native-background-geolocation';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';
// import { navigate } from './RootNavigation';

// const API_BASE = 'https://hala-b-saudi.onrender.com/api/hbs';

// let locationSub: Subscription | null = null;
// let motionSub: Subscription | null = null;
// let providerSub: Subscription | null = null;
// let activitySub: Subscription | null = null;
// let authorizationSub: Subscription | null = null;
// let httpSub: Subscription | null = null;

// let httpLock = false;

// type SavedBackendUser = {
//   id: string;
//   name?: string;
//   email?: string;
//   phone?: string;
// };

// async function fetchVenueById(venueId: string) {
//   try {
//     const res = await fetch(`${API_BASE}/venues/${venueId}`);
//     const json = await res.json().catch(() => ({}));
//     return json?.data || null;
//   } catch (e) {
//     console.log('❌ fetchVenueById error:', e);
//     return null;
//   }
// }

// async function openFromData(data: any) {
//   try {
//     const screen = data?.screen;
//     const venueId = data?.venueId;

//     if (screen === 'SelectedVenue' && venueId) {
//       const venue = await fetchVenueById(venueId);
//       if (venue) {
//         navigate('SelectedVenue', { item: venue });
//       } else {
//         navigate('Home');
//       }
//       return;
//     }

//     if (screen) navigate(screen);
//   } catch (e) {
//     console.log('❌ openFromData error:', e);
//   }
// }

// async function getAuthData() {
//   try {
//     const fcmToken = await messaging().getToken();
//     const userRaw = await AsyncStorage.getItem('hala_user_backend');

//     if (!userRaw) {
//       return { fcmToken, userId: null };
//     }

//     const user: SavedBackendUser = JSON.parse(userRaw);

//     return {
//       fcmToken,
//       userId: user?.id || null,
//     };
//   } catch (error) {
//     console.log('❌ getAuthData error:', error);
//     return { fcmToken: null, userId: null };
//   }
// }

// async function sendLocationToBackend(location: Location) {
//   if (httpLock) {
//     console.log('⏳ Backend request skipped: previous request in progress');
//     return;
//   }

//   httpLock = true;

//   try {
//     const { fcmToken, userId } = await getAuthData();

//     if (!fcmToken || !userId) {
//       console.log('⚠️ Missing fcmToken or userId');
//       return;
//     }

//     const payload = {
//       token: fcmToken,
//       userLatitude: location.coords.latitude,
//       userLongitude: location.coords.longitude,
//       userId,
//     };

//     console.log('📤 sending payload:', JSON.stringify(payload, null, 2));

//     const response = await fetch(`${API_BASE}/send-venue-notification`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     const json = await response.json().catch(() => ({}));
//     console.log('📥 venue check response:', JSON.stringify(json, null, 2));
//   } catch (error) {
//     console.log('❌ sendLocationToBackend error:', error);
//   } finally {
//     httpLock = false;
//   }
// }

// function removeAllListeners() {
//   if (locationSub) {
//     locationSub.remove();
//     locationSub = null;
//   }
//   if (motionSub) {
//     motionSub.remove();
//     motionSub = null;
//   }
//   if (providerSub) {
//     providerSub.remove();
//     providerSub = null;
//   }
//   if (activitySub) {
//     activitySub.remove();
//     activitySub = null;
//   }
//   if (authorizationSub) {
//     authorizationSub.remove();
//     authorizationSub = null;
//   }
//   if (httpSub) {
//     httpSub.remove();
//     httpSub = null;
//   }
// }

// export async function initBackgroundVenueTracker() {
//   try {
//     removeAllListeners();

//     locationSub = BackgroundGeolocation.onLocation(
//       async (location: Location) => {
//         const lat = location.coords.latitude;
//         const lng = location.coords.longitude;
//         const accuracy = location.coords.accuracy;

//         console.log(`📍 onLocation => lat: ${lat}, lng: ${lng}, accuracy: ${accuracy}`);

//         await sendLocationToBackend(location);
//       },
//       (error) => {
//         console.log('❌ onLocation error:', JSON.stringify(error, null, 2));
//       }
//     );

//     motionSub = BackgroundGeolocation.onMotionChange((event: MotionChangeEvent) => {
//       console.log('🚶 motion change:', JSON.stringify(event, null, 2));
//     });

//     providerSub = BackgroundGeolocation.onProviderChange((event: ProviderChangeEvent) => {
//       console.log('📡 provider change:', JSON.stringify(event, null, 2));
//     });

//     activitySub = BackgroundGeolocation.onActivityChange((event) => {
//       console.log('🏃 activity change:', JSON.stringify(event, null, 2));
//     });

//     authorizationSub = BackgroundGeolocation.onAuthorization((event: AuthorizationEvent) => {
//       console.log('🔐 authorization event:', JSON.stringify(event, null, 2));
//     });

//     httpSub = BackgroundGeolocation.onHttp((event: HttpEvent) => {
//       console.log('🌐 http event:', JSON.stringify(event, null, 2));
//     });

//     const state: State = await BackgroundGeolocation.ready({
//       desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//       distanceFilter: 200,
//       stopTimeout: 5,
//       debug: false,
//       logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//       stopOnTerminate: false,
//       startOnBoot: true,
//       enableHeadless: true,
//       foregroundService: true,
//       allowsBackgroundLocationUpdates: true,
//       pausesLocationUpdatesAutomatically: false,
//       showsBackgroundLocationIndicator: true,
//       locationAuthorizationRequest: 'Always',
//       disableMotionActivityUpdates: true,
//     });

//     console.log('✅ BG Geo ready, state:', JSON.stringify(state, null, 2));

//     if (!state.enabled) {
//       await BackgroundGeolocation.start();
//       console.log('🚀 BackgroundGeolocation started');
//     } else {
//       console.log('ℹ️ BackgroundGeolocation already started');
//     }
//   } catch (error) {
//     console.log('❌ initBackgroundVenueTracker error:', error);
//   }
// }

// export async function stopBackgroundVenueTracker() {
//   try {
//     removeAllListeners();
//     await BackgroundGeolocation.stop();
//     console.log('🛑 BackgroundGeolocation stopped');
//   } catch (error) {
//     console.log('❌ stopBackgroundVenueTracker error:', error);
//   }
// }

// const Notifications = async () => {
//   try {
//     if (Platform.OS === 'ios') {
//       await messaging().requestPermission({
//         provisional: true,
//       });
//     }

//     if (Platform.OS === 'android' && Platform.Version >= 33) {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//       );
//       if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
//     }

//     const token = await messaging().getToken();
//     console.log('🔔 FCM Token:', token);

//     messaging().onNotificationOpenedApp(async (remoteMessage) => {
//       await openFromData(remoteMessage?.data || {});
//     });

//     const initial = await messaging().getInitialNotification();
//     if (initial?.data) {
//       await openFromData(initial.data);
//     }
//   } catch (e) {
//     console.log('❌ Notifications init error:', e);
//   }
// };

// export default Notifications;

























