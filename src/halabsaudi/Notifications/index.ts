import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import { navigate } from './RootNavigation';

const VENUES_API = 'https://hala-b-saudi.onrender.com/api/hbs/venues';
const VENUES_CACHE_KEY = 'H-venues_cache_v3';
const GEOFENCE_RADIUS = 2000;
const CHANNEL_ID = 'geofence_channel';
const COOLDOWN_KEY = 'geofence_cooldown';
export const PENDING_VENUE_KEY = 'pending_venue_navigate'; // ✅ export — index.js bhi use karega

let isTrackerInitialized = false;
let geofenceSubscription: any = null;

// ─── Venues ───────────────────────────────────────────────────────────────────

async function fetchVenuesFromAPI() {
  try {
    const response = await fetch(VENUES_API);
    const json = await response.json();
    if (!json?.data || !Array.isArray(json.data)) return [];
    await AsyncStorage.setItem(VENUES_CACHE_KEY, JSON.stringify({ data: json.data }));
    return json.data;
  } catch (e) {
    console.log('[Venues] API error', e);
    return [];
  }
}

async function getVenues() {
  try {
    const raw = await AsyncStorage.getItem(VENUES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.data) && parsed.data.length) {
        fetchVenuesFromAPI().catch(() => {});
        return parsed.data;
      }
    }
    return await fetchVenuesFromAPI();
  } catch (e) {
    return [];
  }
}

function getVenueName(venue: any): string {
  return (
    venue?.name || venue?.title || venue?.venueName ||
    venue?.branchName || venue?.locationName || venue?.shopName ||
    venue?._id || venue?.id || 'Unknown Venue'
  );
}

// ─── Cooldown — din mein 1 baar per venue ─────────────────────────────────────

export async function canShowNotification(venueId: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
    const cooldowns = raw ? JSON.parse(raw) : {};
    const lastTime = cooldowns[venueId];
    if (!lastTime) return true;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    return now - lastTime > oneDayMs;
  } catch {
    return true;
  }
}

export async function saveCooldown(venueId: string) {
  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
    const cooldowns = raw ? JSON.parse(raw) : {};
    cooldowns[venueId] = Date.now();
    await AsyncStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
  } catch {}
}

// ─── Pending Navigation — Killed Mode ke liye ─────────────────────────────────
// Flow:
// 1. User notification press kare (app killed ho)
// 2. index.js ka onBackgroundEvent → venueId AsyncStorage mein save hoga
// 3. App open ho → AppStack ke NavigationContainer onReady → checkAndNavigatePendingVenue()
// 4. Venue screen pe navigate ho jaye

export async function checkAndNavigatePendingVenue() {
  try {
    const venueId = await AsyncStorage.getItem(PENDING_VENUE_KEY);
    if (!venueId) return;
    await AsyncStorage.removeItem(PENDING_VENUE_KEY);
    setTimeout(async () => {
      await navigateToVenue(venueId);
    }, 500);
  } catch (e) {
    console.log('[PendingNav] Error:', e);
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function setupNotificationChannel() {
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Geofence Alerts',
      importance: AndroidImportance.HIGH,
    });
  } catch (e) {
    console.log('[Notifee] Channel error', e);
  }
}

async function requestNotificationPermission() {
  try {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch (e) {
    return false;
  }
}

export async function showGeofenceNotification(venueName: string, venueId: string) {
  try {
    await notifee.displayNotification({
      title: '🎉 Hala B Saudi',
      body: `You are near ${venueName}! Check exclusive offers.`,
      data: { screen: 'SelectedVenue', venueId },
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: { alert: true, badge: true, sound: true },
      },
    });
  } catch (e) {
    console.log('[Notifee] Display error', e);
  }
}

// ─── Navigate to Venue ────────────────────────────────────────────────────────

async function navigateToVenue(venueId: string) {
  try {
    const venues = await getVenues();
    const venue = venues.find((v: any) => (v._id || v.id) === venueId);
    if (venue) {
      const item = { id: venue._id || venue.id, ...venue };
      navigate('SelectedVenue', { item });
    }
  } catch (e) {
    console.log('[Navigate] Error:', e);
  }
}

// ─── Notification Press Handler ───────────────────────────────────────────────
// ⚠️  SIRF onForegroundEvent yahan register hoga
// ⚠️  onBackgroundEvent SIRF index.js mein hoga — yahan BILKUL nahi likhna

export function setupNotificationPressHandler() {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      const venueId = detail?.notification?.data?.venueId as string;
      if (venueId) {
        await navigateToVenue(venueId);
      }
    }
  });
}

// ─── Geofences ────────────────────────────────────────────────────────────────

export async function registerVenueGeofences() {
  try {
    const venues = await getVenues();
    const geofences = venues
      .filter((v: any) => {
        const id = v?._id || v?.id;
        const lat = Number(v?.latitude);
        const lng = Number(v?.longitude);
        return id && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      })
      .map((v: any) => ({
        identifier: String(v._id || v.id),
        latitude: Number(v.latitude),
        longitude: Number(v.longitude),
        radius: GEOFENCE_RADIUS,
        notifyOnEntry: true,
        notifyOnExit: false,
        extras: { name: getVenueName(v) },
      }));

    if (!geofences.length) {
      console.log('[Geofence] No valid geofences');
      return;
    }
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.addGeofences(geofences);
    console.log('[Geofence] Registered:', geofences.length);
  } catch (e) {
    console.log('[Geofence] Registration error', e);
  }
}

// ─── Main Init ────────────────────────────────────────────────────────────────

export async function initBackgroundVenueTracker() {
  try {
    if (isTrackerInitialized) {
      console.log('[Tracker] Already initialized');
      return;
    }

    await requestNotificationPermission();
    await setupNotificationChannel();
    setupNotificationPressHandler(); // ✅ Sirf foreground handler yahan

    const state = await BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 50,
      stopOnTerminate: false,  // Android: killed app ke baad bhi kaam kare
      startOnBoot: true,       // Device restart ke baad auto start
      locationAuthorizationRequest: 'Always',
      pausesLocationUpdatesAutomatically: false,
      geofenceInitialTriggerEntry: true,
      debug: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
      stopTimeout: 5,
    });

    console.log('[Tracker] Ready. Enabled:', state.enabled);

    geofenceSubscription?.remove?.();
    geofenceSubscription = BackgroundGeolocation.onGeofence(async event => {
      console.log('[Geofence] Event:', event.action, event.identifier);
      if (event.action === 'ENTER') {
        const venueId = event.identifier;
        const venueName = event?.extras?.name || 'one of our venues';

        const allowed = await canShowNotification(venueId);
        if (!allowed) {
          console.log('[Geofence] Cooldown active for:', venueName);
          return;
        }
        await saveCooldown(venueId);
        await showGeofenceNotification(venueName, venueId);
      }
    });

    await registerVenueGeofences();

    if (!state.enabled) {
      await BackgroundGeolocation.startGeofences();
      console.log('[Tracker] Geofences started');
    }

    isTrackerInitialized = true;
    console.log('[Tracker] ✅ Initialized successfully');
  } catch (e) {
    isTrackerInitialized = false;
    console.log('[Tracker] Init error', e);
  }
}

export async function stopBackgroundVenueTracker() {
  try {
    geofenceSubscription?.remove?.();
    geofenceSubscription = null;
    isTrackerInitialized = false;
    await BackgroundGeolocation.stop();
    console.log('[Tracker] Stopped');
  } catch (e) {
    console.log('[Tracker] Stop error', e);
  }
}















// import BackgroundGeolocation from 'react-native-background-geolocation';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import notifee, {
//   AndroidImportance,
//   AuthorizationStatus,
//   EventType,
// } from '@notifee/react-native';
// import { navigate } from './RootNavigation';

// const VENUES_API = 'https://hala-b-saudi.onrender.com/api/hbs/venues';
// const VENUES_CACHE_KEY = 'H-venues_cache_v3';
// const GEOFENCE_RADIUS = 1000;
// const CHANNEL_ID = 'geofence_channel';
// const COOLDOWN_KEY = 'geofence_cooldown';

// let isTrackerInitialized = false;
// let geofenceSubscription: any = null;

// // ─── Venues ───────────────────────────────────────────────────────────────────

// async function fetchVenuesFromAPI() {
//   try {
//     const response = await fetch(VENUES_API);
//     const json = await response.json();
//     if (!json?.data || !Array.isArray(json.data)) return [];
//     await AsyncStorage.setItem(
//       VENUES_CACHE_KEY,
//       JSON.stringify({ data: json.data }),
//     );
//     return json.data;
//   } catch (e) {
//     console.log('[Venues] API error', e);
//     return [];
//   }
// }

// async function getVenues() {
//   try {
//     const raw = await AsyncStorage.getItem(VENUES_CACHE_KEY);
//     if (raw) {
//       const parsed = JSON.parse(raw);
//       if (Array.isArray(parsed?.data) && parsed.data.length) {
//         fetchVenuesFromAPI().catch(() => {});
//         return parsed.data;
//       }
//     }
//     return await fetchVenuesFromAPI();
//   } catch (e) {
//     return [];
//   }
// }

// function getVenueName(venue: any): string {
//   return (
//     venue?.name || venue?.title || venue?.venueName ||
//     venue?.branchName || venue?.locationName || venue?.shopName ||
//     venue?._id || venue?.id || 'Unknown Venue'
//   );
// }

// // ─── Cooldown — din mein 1 baar per venue ────────────────────────────────────

// async function canShowNotification(venueId: string): Promise<boolean> {
//   try {
//     const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
//     const cooldowns = raw ? JSON.parse(raw) : {};
//     const lastTime = cooldowns[venueId];
//     if (!lastTime) return true;

//     const now = Date.now();
//     const oneDayMs = 24 * 60 * 60 * 1000;
//     return now - lastTime > oneDayMs;
//   } catch {
//     return true;
//   }
// }

// async function saveCooldown(venueId: string) {
//   try {
//     const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
//     const cooldowns = raw ? JSON.parse(raw) : {};
//     cooldowns[venueId] = Date.now();
//     await AsyncStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
//   } catch {}
// }

// // ─── Notifications ────────────────────────────────────────────────────────────

// export async function setupNotificationChannel() {
//   try {
//     await notifee.createChannel({
//       id: CHANNEL_ID,
//       name: 'Geofence Alerts',
//       importance: AndroidImportance.HIGH,
//     });
//   } catch (e) {
//     console.log('[Notifee] Channel error', e);
//   }
// }

// async function requestNotificationPermission() {
//   try {
//     const settings = await notifee.requestPermission();
//     return (
//       settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
//       settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
//     );
//   } catch (e) {
//     return false;
//   }
// }

// export async function showGeofenceNotification(venueName: string, venueId: string) {
//   try {
//     await notifee.displayNotification({
//       title: '🎉 Hala B Saudi',
//       body: `You are near ${venueName}! Check exclusive offers.`,
//       data: {
//         screen: 'SelectedVenue',
//         venueId: venueId,
//       },
//       android: {
//         channelId: CHANNEL_ID,
//         pressAction: { id: 'default' },
//         importance: AndroidImportance.HIGH,
//       },
//       ios: {
//         sound: 'default',
//         foregroundPresentationOptions: {
//           alert: true,
//           badge: true,
//           sound: true,
//         },
//       },
//     });
//   } catch (e) {
//     console.log('[Notifee] Display error', e);
//   }
// }

// // ─── Notification Press Handler ───────────────────────────────────────────────

// export function setupNotificationPressHandler() {
//   // Foreground press
//   notifee.onForegroundEvent(async ({ type, detail }) => {
//     if (type === EventType.PRESS) {
//       const venueId = detail?.notification?.data?.venueId as string;
//       if (venueId) {
//         await navigateToVenue(venueId);
//       }
//     }
//   });

//   // Background/killed press
//   notifee.onBackgroundEvent(async ({ type, detail }) => {
//     if (type === EventType.PRESS) {
//       const venueId = detail?.notification?.data?.venueId as string;
//       if (venueId) {
//         await navigateToVenue(venueId);
//       }
//     }
//   });
// }

// async function navigateToVenue(venueId: string) {
//   try {
//     const venues = await getVenues();
//     const venue = venues.find((v: any) => (v._id || v.id) === venueId);
//     if (venue) {
//       const item = { id: venue._id || venue.id, ...venue };
//       navigate('SelectedVenue', { item });
//     }
//   } catch (e) {
//     console.log('[Navigate] Error:', e);
//   }
// }

// // ─── Geofences ────────────────────────────────────────────────────────────────

// export async function registerVenueGeofences() {
//   try {
//     const venues = await getVenues();

//     const geofences = venues
//       .filter((v: any) => {
//         const id = v?._id || v?.id;
//         const lat = Number(v?.latitude);
//         const lng = Number(v?.longitude);
//         return id && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
//       })
//       .map((v: any) => ({
//         identifier: String(v._id || v.id),
//         latitude: Number(v.latitude),
//         longitude: Number(v.longitude),
//         radius: GEOFENCE_RADIUS,
//         notifyOnEntry: true,
//         notifyOnExit: false,
//         extras: { name: getVenueName(v) },
//       }));

//     if (!geofences.length) {
//       console.log('[Geofence] No valid geofences');
//       return;
//     }

//     await BackgroundGeolocation.removeGeofences();
//     await BackgroundGeolocation.addGeofences(geofences);
//     console.log('[Geofence] Registered:', geofences.length);
//   } catch (e) {
//     console.log('[Geofence] Registration error', e);
//   }
// }

// // ─── Main Init ────────────────────────────────────────────────────────────────

// export async function initBackgroundVenueTracker() {
//   try {
//     if (isTrackerInitialized) {
//       console.log('[Tracker] Already initialized');
//       return;
//     }

//     await requestNotificationPermission();
//     await setupNotificationChannel();
//     setupNotificationPressHandler();

//     const state = await BackgroundGeolocation.ready({
//       desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//       distanceFilter: 50,
//       stopOnTerminate: false,
//       startOnBoot: true,
//       locationAuthorizationRequest: 'Always',
//       pausesLocationUpdatesAutomatically: false,
//       geofenceInitialTriggerEntry: true,
//       debug: false,
//       logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
//       stopTimeout: 5,
//     });

//     console.log('[Tracker] Ready. Enabled:', state.enabled);

//     geofenceSubscription?.remove?.();
//     geofenceSubscription = BackgroundGeolocation.onGeofence(async event => {
//       console.log('[Geofence] Event:', event.action, event.identifier);
//       if (event.action === 'ENTER') {
//         const venueId = event.identifier;
//         const venueName = event?.extras?.name || 'one of our venues';

//         // ✅ Cooldown check — din mein 1 baar
//         const allowed = await canShowNotification(venueId);
//         if (!allowed) {
//           console.log('[Geofence] Cooldown active for:', venueName);
//           return;
//         }

//         await saveCooldown(venueId);
//         await showGeofenceNotification(venueName, venueId);
//       }
//     });

//     await registerVenueGeofences();

//     if (!state.enabled) {
//       await BackgroundGeolocation.startGeofences();
//       console.log('[Tracker] Geofences started');
//     }

//     isTrackerInitialized = true;
//     console.log('[Tracker] ✅ Initialized successfully');
//   } catch (e) {
//     isTrackerInitialized = false;
//     console.log('[Tracker] Init error', e);
//   }
// }

// export async function stopBackgroundVenueTracker() {
//   try {
//     geofenceSubscription?.remove?.();
//     geofenceSubscription = null;
//     isTrackerInitialized = false;
//     await BackgroundGeolocation.stop();
//     console.log('[Tracker] Stopped');
//   } catch (e) {
//     console.log('[Tracker] Stop error', e);
//   }
// }
