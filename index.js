import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundGeolocation from 'react-native-background-geolocation';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PENDING_VENUE_KEY,
  CHANNEL_ID,
  COOLDOWN_STORE,
  RADIUS_METERS,
} from './src/halabsaudi/Notifications/index';

const CHAT_CHANNEL_ID = 'chat_messages';

// ─── Channels ─────────────────────────────────────────────────────────────────
async function createChannels() {
  await notifee.createChannel({
    id: CHAT_CHANNEL_ID, name: 'Chat Messages',
    importance: AndroidImportance.HIGH, vibration: true, sound: 'default',
  });
  await notifee.createChannel({
    id: CHANNEL_ID, name: 'Venue Alerts',
    importance: AndroidImportance.HIGH, vibration: true, sound: 'default',
  });
}

// ─── Distance ─────────────────────────────────────────────────────────────────
function getDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R    = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Cooldown helpers (same logic as venueTracker) ────────────────────────────
async function canNotify(id: string): Promise<boolean> {
  try {
    const raw  = await AsyncStorage.getItem(COOLDOWN_STORE);
    const data = raw ? JSON.parse(raw) : {};
    return data[id] !== new Date().toDateString();
  } catch {
    return true;
  }
}

async function markNotified(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_STORE);
    let data: Record<string, string> = {};
    try { if (raw) data = JSON.parse(raw); } catch {}
    data[id] = new Date().toDateString();
    await AsyncStorage.setItem(COOLDOWN_STORE, JSON.stringify(data));
  } catch {}
}

// ─── Notifee background press ─────────────────────────────────────────────────
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const venueId = detail?.notification?.data?.venueId;
    if (venueId) await AsyncStorage.setItem(PENDING_VENUE_KEY, String(venueId));
  }
});

// ─── FCM background + killed state ────────────────────────────────────────────
messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    await createChannels();
    const { chatId, senderId } = remoteMessage?.data || {};
    if (!chatId) return;

    await notifee.displayNotification({
      title: remoteMessage?.notification?.title || 'New Message',
      body:  remoteMessage?.notification?.body  || 'You have a new message',
      data:  { chatId: String(chatId), senderId: String(senderId || '') },
      android: {
        channelId:     CHAT_CHANNEL_ID,
        importance:    AndroidImportance.HIGH,
        pressAction:   { id: 'default' },
        showTimestamp: true,
        sound:         'default',
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          alert: true, badge: true, sound: true, banner: true,
        },
      },
    });
  } catch (e) {
    console.log('[FCM] Background handler error:', e);
  }
});


// ─── BackgroundGeolocation Headless Task ──────────────────────────────────────
// App killed state mein location + geofence events yahan handle hote hain
BackgroundGeolocation.registerHeadlessTask(async (event: any) => {

  // ✅ GEOFENCE EVENT — app killed ho, venue radius mein ghuse → fire
  if (event.name === 'geofence') {
    const geofence = event.params;
    if (geofence?.action !== 'ENTER') return;

    const id   = geofence.identifier;
    const name = geofence.extras?.name || 'a nearby venue';

    console.log(`[Headless] GEOFENCE ENTER: ${name}`);

    const allowed = await canNotify(id);
    if (!allowed) {
      console.log('[Headless] Cooldown today:', name);
      return;
    }

    await createChannels();
    // ✅ Mark PEHLE — phir notify
    await markNotified(id);
    await notifee.displayNotification({
      title: '🎉 Hala B Saudi',
      body:  `You're near ${name}! Check exclusive offers now.`,
      data:  { venueId: id },
      android: {
        channelId:     CHANNEL_ID,
        importance:    AndroidImportance.HIGH,
        pressAction:   { id: 'default' },
        smallIcon:     'ic_notification',
        showTimestamp: true,
      },
    });
    console.log('[Headless] ✅ Geofence notification sent:', name);
    return;
  }

  // ✅ LOCATION EVENT — movement based proximity check (backup)
  if (event.name === 'location') {
    const lat = event.params?.coords?.latitude;
    const lon = event.params?.coords?.longitude;
    if (!lat || !lon) return;

    try {
      const raw    = await AsyncStorage.getItem('hbs_venues_v1');
      const venues = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(venues) || venues.length === 0) return;

      for (const v of venues) {
        const vLat = Number(v?.latitude);
        const vLon = Number(v?.longitude);
        const id   = String(v?._id || v?.id || '');
        const name = v?.venueName || v?.name || 'a nearby venue';

        if (!id || isNaN(vLat) || isNaN(vLon) || vLat === 0 || vLon === 0) continue;

        const dist = getDistance(lat, lon, vLat, vLon);
        if (dist > RADIUS_METERS) continue;

        const allowed = await canNotify(id);
        if (!allowed) {
          console.log('[Headless] Cooldown today:', name);
          continue;
        }

        await createChannels();
        // ✅ Mark PEHLE — phir notify
        await markNotified(id);
        await notifee.displayNotification({
          title: '🎉 Hala B Saudi',
          body:  `You're near ${name}! Check exclusive offers now.`,
          data:  { venueId: id },
          android: {
            channelId:     CHANNEL_ID,
            importance:    AndroidImportance.HIGH,
            pressAction:   { id: 'default' },
            smallIcon:     'ic_notification',
            showTimestamp: true,
          },
        });
        console.log('[Headless] ✅ Location notification sent:', name);
      }
    } catch (e) {
      console.log('[Headless] Location event error:', e);
    }
  }
});



AppRegistry.registerComponent(appName, () => App);






// // index.js
// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import BackgroundGeolocation from 'react-native-background-geolocation';
// import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import {
//   PENDING_VENUE_KEY,
//   CHANNEL_ID,
//   COOLDOWN_STORE,
// } from './src/halabsaudi/Notifications/index';

// const CHAT_CHANNEL_ID = 'chat_messages';

// // ─── Create channels ──────────────────────────────────────────────────────────
// async function createChannels() {
//   await notifee.createChannel({
//     id: CHAT_CHANNEL_ID,
//     name: 'Chat Messages',
//     importance: AndroidImportance.HIGH,
//     vibration: true,
//     sound: 'default',
//   });
//   await notifee.createChannel({
//     id: CHANNEL_ID,
//     name: 'Venue Alerts',
//     importance: AndroidImportance.HIGH,
//     vibration: true,
//     sound: 'default',
//   });
// }

// // ─── Notifee background (press handler) ──────────────────────────────────────
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS) {
//     const venueId = detail?.notification?.data?.venueId;
//     if (venueId) {
//       await AsyncStorage.setItem(PENDING_VENUE_KEY, String(venueId));
//     }
//     // chatId press — getInitialNotification in App.tsx handles navigation
//   }
// });

// // ─── FCM BACKGROUND + KILLED STATE ───────────────────────────────────────────
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('[FCM] Background message:', JSON.stringify(remoteMessage?.data));

//   try {
//     await createChannels();

//     const { chatId, senderId } = remoteMessage?.data || {};

//     if (chatId) {
//       const title = remoteMessage?.notification?.title || 'New Message';
//       const body = remoteMessage?.notification?.body || 'You have a new message';

//       await notifee.displayNotification({
//         title,
//         body,
//         data: { chatId: String(chatId), senderId: String(senderId || '') },
//         android: {
//           channelId: CHAT_CHANNEL_ID,
//           importance: AndroidImportance.HIGH,
//           pressAction: { id: 'default' },
//           // ✅ FIX: smallIcon hata diya — default app icon use hoga
//           // Agar custom icon chahiye to android/app/src/main/res/drawable mein
//           // ic_notification.png rakh kar yeh uncomment karo:
//           // smallIcon: 'ic_notification',
//           showTimestamp: true,
//           sound: 'default',
//         },
//         ios: {
//           sound: 'default',
//           foregroundPresentationOptions: {
//             alert: true,
//             badge: true,
//             sound: true,
//             banner: true,
//           },
//         },
//       });

//       console.log('[FCM] ✅ Chat notification shown for chatId:', chatId);
//     }
//   } catch (e) {
//     console.log('[FCM] Background handler error:', e);
//   }
// });

// // ─── Android Headless Task ────────────────────────────────────────────────────
// BackgroundGeolocation.registerHeadlessTask(async (event: any) => {
//   if (event.name !== 'location') return;

//   const location = event.params;
//   const lat = location?.coords?.latitude;
//   const lon = location?.coords?.longitude;
//   if (!lat || !lon) return;

//   try {
//     const raw = await AsyncStorage.getItem('hbs_venues_v1');
//     const venues = raw ? JSON.parse(raw) : [];
//     if (!Array.isArray(venues) || venues.length === 0) return;

//     function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//       const R = 6371000;
//       const dLat = ((lat2 - lat1) * Math.PI) / 180;
//       const dLon = ((lon2 - lon1) * Math.PI) / 180;
//       const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos((lat1 * Math.PI) / 180) *
//           Math.cos((lat2 * Math.PI) / 180) *
//           Math.sin(dLon / 2) *
//           Math.sin(dLon / 2);
//       return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     }

//     const RADIUS = 500;
//     const today = new Date().toDateString();
//     const coolRaw = await AsyncStorage.getItem(COOLDOWN_STORE);
//     let coolData: Record<string, string> = {};
//     try { if (coolRaw) coolData = JSON.parse(coolRaw); } catch {}

//     for (const v of venues) {
//       const vLat = Number(v?.latitude);
//       const vLon = Number(v?.longitude);
//       const id = String(v?._id || v?.id || '');
//       const name = v?.venueName || v?.name || 'a nearby venue';

//       if (!id || isNaN(vLat) || isNaN(vLon) || vLat === 0 || vLon === 0) continue;

//       const dist = getDistance(lat, lon, vLat, vLon);
//       if (dist <= RADIUS) {
//         if (coolData[id] === today) continue;

//         coolData[id] = today;
//         await AsyncStorage.setItem(COOLDOWN_STORE, JSON.stringify(coolData));

//         await notifee.displayNotification({
//           title: '🎉 Hala B Saudi',
//           body: `You're near ${name}! Check exclusive offers now.`,
//           data: { venueId: id },
//           android: {
//             channelId: CHANNEL_ID,
//             importance: AndroidImportance.HIGH,
//             pressAction: { id: 'default' },
//             // ✅ FIX: smallIcon hata diya
//             showTimestamp: true,
//           },
//         });

//         console.log('[Headless] ✅ Notification sent:', name);
//       }
//     }
//   } catch (e) {
//     console.log('[Headless] Error:', e);
//   }
// });

// AppRegistry.registerComponent(appName, () => App);


// index.js
// ✅ FIXES:
//   1. RADIUS_METERS venueTracker se import — everywhere same 500m
//   2. markNotified PEHLE, showNotification BAAD (race condition fix)
//   3. COOLDOWN_STORE same key — geofence + headless + periodic sab share karte hain
//   4. Geofencing headless event bhi handle karta hai (ENTER on killed state)

