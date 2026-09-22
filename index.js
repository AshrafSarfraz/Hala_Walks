import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundGeolocation from 'react-native-background-geolocation';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCachedMessages, setCachedMessages, } from './src/halabsaudi/chat/chatStorage';
// ✅ NEW — ek chat = ek notification (jama nahi hoti)
import { chatNotificationId } from './src/halabsaudi/Notifications/badge';
import { PENDING_VENUE_KEY, CHANNEL_ID, COOLDOWN_STORE, RADIUS_METERS, } from './src/halabsaudi/Notifications/index';
const CHAT_CHANNEL_ID = 'chat_messages';
// ─── Channels ─────────────────────────────────────────────────────────────────
async function createChannels() {
    await notifee.createChannel({
        id: CHAT_CHANNEL_ID,
        name: 'Chat Messages',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
    });
    await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Venue Alerts',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
    });
}
// ─── Distance ─────────────────────────────────────────────────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// ─── Cooldown helpers (same logic as venueTracker) ────────────────────────────
async function canNotify(id) {
    try {
        const raw = await AsyncStorage.getItem(COOLDOWN_STORE);
        const data = raw ? JSON.parse(raw) : {};
        return data[id] !== new Date().toDateString();
    }
    catch {
        return true;
    }
}
async function markNotified(id) {
    try {
        const raw = await AsyncStorage.getItem(COOLDOWN_STORE);
        let data = {};
        try {
            if (raw)
                data = JSON.parse(raw);
        }
        catch { }
        data[id] = new Date().toDateString();
        await AsyncStorage.setItem(COOLDOWN_STORE, JSON.stringify(data));
    }
    catch { }
}
// ─── Notifee background press ─────────────────────────────────────────────────
notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
        const venueId = detail?.notification?.data?.venueId;
        if (venueId)
            await AsyncStorage.setItem(PENDING_VENUE_KEY, String(venueId));
    }
});
// ─── FCM background + killed state ────────────────────────────────────────────
// (purana commented-out handler yahan se hataya — neeche wala asli hai)
// ─── YE KARNA HAI ───
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    try {
        await createChannels();
        const { chatId, senderId, message } = remoteMessage?.data || {};
        if (!chatId)
            return;
        // ✅ NAYA: message ko local cache mein save karo, taake jab user
        // chat screen kholay, message pehle se wahan mojood ho — socket
        // reconnect hone ka intezar kiye bagair.
        if (message) {
            try {
                const parsed = JSON.parse(message);
                const existing = getCachedMessages(chatId) || [];
                const already = existing.some(m => m._id === parsed._id);
                if (!already) {
                    setCachedMessages(chatId, [parsed, ...existing]);
                }
            }
            catch (e) {
                console.log('[FCM] Could not cache message:', e);
            }
        }
        // ✅ FIX: `id`, `groupId` aur `threadId` add kiye.
        //
        //    Pehle ye bina `id` ke chalta tha. Bina id ke notifee HAR BAAR
        //    NAYI notification banata hai — app band hone par aane wala har
        //    message alag notification. Subah uth kar dekho to tray me 30
        //    notifications aur badge par 30, aur kholne par bhi saaf nahi hoti.
        //
        //    Ab ek chat ki nayi notification purani ko REPLACE karti hai.
        const notifId = chatNotificationId(String(chatId));
        await notifee.displayNotification({
            id: notifId,
            title: remoteMessage?.notification?.title || 'New Message',
            body: remoteMessage?.notification?.body || 'You have a new message',
            data: {
                chatId: String(chatId),
                senderId: String(senderId || ''),
                senderName: String(remoteMessage?.data?.senderName || ''),
                senderAvatar: String(remoteMessage?.data?.senderAvatar || ''),
            },
            android: {
                channelId: CHAT_CHANNEL_ID,
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
                showTimestamp: true,
                sound: 'default',
                groupId: notifId,
                autoCancel: true,
            },
            ios: {
                sound: 'default',
                threadId: notifId,
                foregroundPresentationOptions: {
                    alert: true,
                    badge: true,
                    sound: true,
                    banner: true,
                },
            },
        });
    }
    catch (e) {
        console.log('[FCM] Background handler error:', e);
    }
});
// ─── BackgroundGeolocation Headless Task ──────────────────────────────────────
// App killed state mein location + geofence events yahan handle hote hain
BackgroundGeolocation.registerHeadlessTask(async (event) => {
    // ✅ GEOFENCE EVENT — app killed ho, venue radius mein ghuse → fire
    if (event.name === 'geofence') {
        const geofence = event.params;
        if (geofence?.action !== 'ENTER')
            return;
        const id = geofence.identifier;
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
            body: `You're near ${name}! Check exclusive offers now.`,
            data: { venueId: id },
            android: {
                channelId: CHANNEL_ID,
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
                smallIcon: 'ic_notification',
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
        if (!lat || !lon)
            return;
        try {
            const raw = await AsyncStorage.getItem('hbs_venues_v1');
            const venues = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(venues) || venues.length === 0)
                return;
            for (const v of venues) {
                const vLat = Number(v?.latitude);
                const vLon = Number(v?.longitude);
                const id = String(v?._id || v?.id || '');
                const name = v?.venueName || v?.name || 'a nearby venue';
                if (!id || isNaN(vLat) || isNaN(vLon) || vLat === 0 || vLon === 0)
                    continue;
                const dist = getDistance(lat, lon, vLat, vLon);
                if (dist > RADIUS_METERS)
                    continue;
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
                    body: `You're near ${name}! Check exclusive offers now.`,
                    data: { venueId: id },
                    android: {
                        channelId: CHANNEL_ID,
                        importance: AndroidImportance.HIGH,
                        pressAction: { id: 'default' },
                        smallIcon: 'ic_notification',
                        showTimestamp: true,
                    },
                });
                console.log('[Headless] ✅ Location notification sent:', name);
            }
        }
        catch (e) {
            console.log('[Headless] Location event error:', e);
        }
    }
});
AppRegistry.registerComponent(appName, () => App);
