// src/halabsaudi/Notifications/venueTracker.ts
// ✅ DUAL SYSTEM:
//   1. GEOFENCING   — jaise hi venue radius mein enter karo → turant notification ⚡
//   2. PERIODIC     — har 30 min location check → backup (agar already andar ho)
//   Both cooldown share karte hain — sirf 1 notification per venue per day

import BackgroundGeolocation, {
  GeofenceEvent,
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigate } from './RootNavigation';
import {isSocialNotification, saveSocialNavigation} from './social';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const VENUES_API     = 'https://hala-b-saudi.onrender.com/api/hbs/venues';
const VENUES_CACHE   = 'hbs_venues_v1';
const COOLDOWN_STORE = 'hbs_cooldown_v2';
const PENDING_NAV    = 'hbs_pending_nav';
const CHANNEL_ID     = 'hbs_alerts';
export const RADIUS_METERS = 500;

export { PENDING_NAV  as PENDING_VENUE_KEY };
export { CHANNEL_ID };
export { COOLDOWN_STORE };

let initialized    = false;
let geofenceSub: any = null;
let periodicTimer: ReturnType<typeof setInterval> | null = null;

// ✅ In-memory lock — concurrent calls se bachao (race condition fix)
const _processingNow = new Set<string>();

// ─── DISTANCE ─────────────────────────────────────────────────────────────────
function getDistanceMeters(
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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── VENUES ───────────────────────────────────────────────────────────────────
async function fetchAndCacheVenues(): Promise<any[]> {
  try {
    const res  = await fetch(VENUES_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json?.data)) return [];
    await AsyncStorage.setItem(VENUES_CACHE, JSON.stringify(json.data));
    return json.data;
  } catch (e) {
    console.log('[HBS] fetchVenues error:', e);
    return [];
  }
}

export async function getVenues(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(VENUES_CACHE);
    if (raw) {
      const cached = JSON.parse(raw);
      if (Array.isArray(cached) && cached.length > 0) {
        fetchAndCacheVenues(); // silent background refresh
        return cached;
      }
    }
  } catch {}
  return fetchAndCacheVenues();
}

function venueName(v: any): string {
  return v?.venueName || v?.name || v?.title || v?.branchName || 'a nearby venue';
}
function venueId(v: any): string {
  return String(v?._id || v?.id || '');
}

// ─── COOLDOWN — 1 per calendar day per venue ──────────────────────────────────
export async function canNotify(id: string): Promise<boolean> {
  try {
    const raw  = await AsyncStorage.getItem(COOLDOWN_STORE);
    const data: Record<string, string> = raw ? JSON.parse(raw) : {};
    return data[id] !== new Date().toDateString();
  } catch {
    return true;
  }
}

export async function markNotified(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_STORE);
    let data: Record<string, string> = {};
    try { if (raw) data = JSON.parse(raw); } catch {}
    data[id] = new Date().toDateString();
    await AsyncStorage.setItem(COOLDOWN_STORE, JSON.stringify(data));
  } catch (e) {
    console.log('[HBS] markNotified error:', e);
  }
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────
export async function createChannel() {
  await notifee.createChannel({
    id:         CHANNEL_ID,
    name:       'Venue Alerts',
    importance: AndroidImportance.HIGH,
    vibration:  true,
    sound:      'default',
  });
}

export async function showNotification(name: string, id: string) {
  try {
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
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          alert: true, badge: true, sound: true, banner: true,
        },
      },
    });
    console.log('[HBS] ✅ Notified:', name);
  } catch (e) {
    console.log('[HBS] showNotification error:', e);
  }
}

// ─── CORE NOTIFY LOGIC — shared by geofence + periodic ───────────────────────
async function tryNotifyVenue(id: string, name: string): Promise<void> {
  // Lock check
  if (_processingNow.has(id)) {
    console.log('[HBS] Already processing:', name);
    return;
  }
  // Cooldown check
  const allowed = await canNotify(id);
  if (!allowed) {
    console.log('[HBS] Cooldown today:', name);
    return;
  }
  _processingNow.add(id);
  try {
    await markNotified(id);       // PEHLE mark
    await showNotification(name, id); // PHIR notify
  } finally {
    _processingNow.delete(id);
  }
}

// ─── GEOFENCE ENTER HANDLER ───────────────────────────────────────────────────
async function onGeofenceEnter(event: GeofenceEvent) {
  if (event.action !== 'ENTER') return;
  const id   = event.identifier;
  const name = event.extras?.name || 'a nearby venue';
  console.log(`[HBS] GEOFENCE ENTER: ${name}`);
  await tryNotifyVenue(id, name);
}

// ─── PROXIMITY CHECK — used by periodic timer + startup ───────────────────────
export async function checkProximity(lat: number, lon: number): Promise<void> {
  try {
    const venues = await getVenues();
    for (const v of venues) {
      const vLat = Number(v?.latitude);
      const vLon = Number(v?.longitude);
      const id   = venueId(v);
      if (!id || isNaN(vLat) || isNaN(vLon) || vLat === 0 || vLon === 0) continue;
      const dist = getDistanceMeters(lat, lon, vLat, vLon);
      if (dist > RADIUS_METERS) continue;
      console.log(`[HBS] PERIODIC: in radius ${venueName(v)} | ${Math.round(dist)}m`);
      await tryNotifyVenue(id, venueName(v));
    }
  } catch (e) {
    console.log('[HBS] checkProximity error:', e);
  }
}

// ─── REGISTER GEOFENCES for all venues ───────────────────────────────────────
async function registerGeofences(venues: any[]) {
  await BackgroundGeolocation.removeGeofences();
  const geofences = venues
    .filter(v => {
      const lat = Number(v?.latitude);
      const lon = Number(v?.longitude);
      return venueId(v) && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
    })
    .map(v => ({
      identifier:    venueId(v),
      latitude:      Number(v.latitude),
      longitude:     Number(v.longitude),
      radius:        RADIUS_METERS,
      notifyOnEntry: true,
      notifyOnExit:  false,
      extras:        { name: venueName(v) },
    }));

  if (!geofences.length) {
    console.log('[HBS] No valid venues for geofencing');
    return;
  }
  await BackgroundGeolocation.addGeofences(geofences);
  console.log(`[HBS] ✅ ${geofences.length} geofences registered`);
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
async function goToVenue(id: string) {
  try {
    const venues = await getVenues();
    const v = venues.find(x => venueId(x) === id);
    if (v) navigate('SelectedVenue', { item: { id: venueId(v), ...v } });
  } catch (e) {
    console.log('[HBS] goToVenue error:', e);
  }
}

export function setupNotificationHandlers() {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      const id = detail.notification?.data?.venueId as string;
      if (id) await goToVenue(id);
    }
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      if (isSocialNotification(detail.notification?.data)) {
        await saveSocialNavigation(detail.notification?.data);
        return;
      }
      const id = detail.notification?.data?.venueId as string;
      if (id) await AsyncStorage.setItem(PENDING_NAV, id);
    }
  });
}

export async function checkPendingNavigation() {
  try {
    const id = await AsyncStorage.getItem(PENDING_NAV);
    if (!id) return;
    await AsyncStorage.removeItem(PENDING_NAV);
    setTimeout(() => goToVenue(id), 800);
  } catch (e) {
    console.log('[HBS] checkPendingNavigation error:', e);
  }
}

// ─── START PERIODIC CHECKER ────────────────────────────────────────────────────
function startPeriodicCheck() {
  if (periodicTimer) clearInterval(periodicTimer);

  periodicTimer = setInterval(async () => {
    try {
      console.log('[HBS] Periodic check running...');
      const loc = await BackgroundGeolocation.getCurrentPosition({
        timeout: 15,
        samples: 1,
        persist: false,
      });
      await checkProximity(loc.coords.latitude, loc.coords.longitude);
    } catch (e) {
      console.log('[HBS] Periodic check error:', e);
    }
  }, 30 * 60 * 1000); // every 30 minutes

  console.log('[HBS] ✅ Periodic check started (every 30 min)');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
export async function initVenueTracker() {
  if (initialized) {
    console.log('[HBS] Already initialized');
    return;
  }

  try {
    await createChannel();
    setupNotificationHandlers();

    await BackgroundGeolocation.ready({
      geolocation: {
        distanceFilter: 200,
        desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
        locationAuthorizationRequest: 'Always',
        disableLocationAuthorizationAlert: false,
        pausesLocationUpdatesAutomatically: false,
        activityType: BackgroundGeolocation.ActivityType.Other,
        geofenceModeHighAccuracy: true,
      },
      app: {
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        notification: {title: 'Hala B Saudi', text: 'Watching for nearby venues...', channelId: CHANNEL_ID},
      },
      activity: {disableMotionActivityUpdates: true},
      logger: {debug: false, logLevel: BackgroundGeolocation.LogLevel.Off},
    });

    // ✅ System 1: Geofence listener
    geofenceSub?.remove?.();
    geofenceSub = BackgroundGeolocation.onGeofence(onGeofenceEnter);

    await BackgroundGeolocation.start();

    // ✅ Load venues + register geofences
    const venues = await fetchAndCacheVenues();
    await registerGeofences(venues);

    // ✅ System 2: 30-min periodic check (backup)
    startPeriodicCheck();

    // ✅ Startup check — agar already andar hain
    try {
      const loc = await BackgroundGeolocation.getCurrentPosition({
        timeout: 30, samples: 1, persist: false,
      });
      console.log('[HBS] Startup position check...');
      await checkProximity(loc.coords.latitude, loc.coords.longitude);
    } catch (e) {
      console.log('[HBS] getCurrentPosition error:', e);
    }

    initialized = true;
    console.log('[HBS] ✅ Dual system active: Geofencing + Periodic (30min)');
  } catch (e) {
    initialized = false;
    console.log('[HBS] init error:', e);
  }
}

// ─── STOP ─────────────────────────────────────────────────────────────────────
export async function stopVenueTracker() {
  try {
    if (periodicTimer) { clearInterval(periodicTimer); periodicTimer = null; }
    geofenceSub?.remove?.();
    geofenceSub = null;
    initialized = false;
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.stop();
    console.log('[HBS] Tracker stopped');
  } catch (e) {
    console.log('[HBS] stop error:', e);
  }
}
