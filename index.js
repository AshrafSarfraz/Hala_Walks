

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundGeolocation from 'react-native-background-geolocation';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  canShowNotification,
  saveCooldown,
  PENDING_VENUE_KEY,
} from './src/halabsaudi/Notifications';

const CHANNEL_ID = 'geofence_channel';

// ✅ App register
AppRegistry.registerComponent(appName, () => App);

// ─────────────────────────────────────────────────────────────────────────────
// ✅ onBackgroundEvent — SIRF YAHAN, Notifications.ts mein BILKUL nahi
// Notifee sirf ek background handler support karta hai
// Background = app background mein ho
// Killed = app completely band ho — press pe app khulega, phir pending nav handle karega
// ─────────────────────────────────────────────────────────────────────────────

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const venueId = detail?.notification?.data?.venueId;
    if (venueId) {
      // Navigation directly possible nahi killed/background mein
      // venueId save karo → app open hone ke baad AppStack ka onReady navigate karega
      try {
        await AsyncStorage.setItem(PENDING_VENUE_KEY, venueId);
      } catch (e) {
        console.log('[BGEvent] Save error:', e);
      }
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Android Headless Task
// Ye tab chalta hai jab app COMPLETELY killed ho aur geofence trigger ho
// iOS pe ye nahi chalta — iOS ka BGGeolocation apna mechanism use karta hai
// ─────────────────────────────────────────────────────────────────────────────

const headlessTask = async (event: any) => {
  if (event.name === 'geofence') {
    const geofenceEvent = event.params;
    if (geofenceEvent?.action === 'ENTER') {
      try {
        const venueId = geofenceEvent?.identifier || '';
        const venueName = geofenceEvent?.extras?.name || 'one of our venues';

        // Cooldown check — din mein 1 baar (same function Notifications.ts se)
        const allowed = await canShowNotification(venueId);
        if (!allowed) {
          console.log('[Headless] Cooldown active for:', venueName);
          return;
        }
        await saveCooldown(venueId);

        // Channel create karo — headless context mein pehle se nahi hota
        await notifee.createChannel({
          id: CHANNEL_ID,
          name: 'Geofence Alerts',
          importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
          title: '🎉 Hala B Saudi',
          body: `You are near ${venueName}! Check exclusive offers.`,
          data: { screen: 'SelectedVenue', venueId },
          android: {
            channelId: CHANNEL_ID,
            pressAction: { id: 'default' },
            importance: AndroidImportance.HIGH,
          },
        });

        console.log('[Headless] ✅ Notification sent for:', venueName);
      } catch (e) {
        console.log('[Headless] Error:', e);
      }
    }
  }
};

BackgroundGeolocation.registerHeadlessTask(headlessTask);








// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
// import BackgroundGeolocation from 'react-native-background-geolocation';
// import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// const CHANNEL_ID = 'geofence_channel';

// // ✅ App register
// AppRegistry.registerComponent(appName, () => App);

// // ✅ ZAROORI — Notifee background/killed press handler
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS) {
//     const venueId = detail?.notification?.data?.venueId;
//     if (venueId) {
//       const { navigateToVenueFromBackground } = require('./src/halabsaudi/Notifications');
//       await navigateToVenueFromBackground(venueId);
//     }
//   }
// });

// // ✅ Headless Task — Android ke liye
// const headlessTask = async (event: any) => {
//   if (event.name === 'geofence') {
//     const geofenceEvent = event.params;
//     if (geofenceEvent?.action === 'ENTER') {
//       try {
//         await notifee.createChannel({
//           id: CHANNEL_ID,
//           name: 'Geofence Alerts',
//           importance: AndroidImportance.HIGH,
//         });
//         const venueName = geofenceEvent?.extras?.name || 'one of our venues';
//         const venueId = geofenceEvent?.identifier || '';
//         await notifee.displayNotification({
//           title: '🎉 Hala B Saudi',
//           body: `You are near ${venueName}! Check exclusive offers.`,
//           data: { screen: 'SelectedVenue', venueId },
//           android: {
//             channelId: CHANNEL_ID,
//             pressAction: { id: 'default' },
//             importance: AndroidImportance.HIGH,
//           },
//         });
//       } catch (e) {
//         console.log('[Headless] Error:', e);
//       }
//     }
//   }
// };

// BackgroundGeolocation.registerHeadlessTask(headlessTask);