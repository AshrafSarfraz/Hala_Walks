import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = [
  'hala_token',
  'hala_user',
  'hala_user_backend',
  'hala_user_data',
];
const CACHE_KEYS = [
  'geofence_cooldown',
  'pending_venue_navigate',
  'hala_show_last_seen',
  'hala_show_online_status',
  'hala_conversations',
  'hala_users_cache',
  'hala_users_cache_v2',
  'hala_users_cache_meta',
  'hala_blocked_cache',
  'map_profile_checkins_cache_v1',
  'hala_background_location_opt_in',
];

export async function clearLogoutStorage() {
  try {
    await AsyncStorage.multiRemove(AUTH_KEYS);
  } catch {
    // Fall back to individual calls if Android's batch removal fails.
    await Promise.allSettled(
      AUTH_KEYS.map(key => AsyncStorage.removeItem(key)),
    );
  }
  for (const key of AUTH_KEYS) {
    if ((await AsyncStorage.getItem(key)) !== null) {
      await AsyncStorage.removeItem(key);
      if ((await AsyncStorage.getItem(key)) !== null)
        throw new Error(`Session storage could not be cleared (${key}).`);
    }
  }
  // Optional cache maintenance must not turn a completed logout into an error.
  try {
    const keys = await AsyncStorage.getAllKeys();
    const personal = keys.filter(
      key =>
        typeof key === 'string' &&
        (key.startsWith('profile_checkins_v5_') ||
          key.startsWith('mute_') ||
          key.startsWith('hbs_chat_')),
    );
    await AsyncStorage.multiRemove([...new Set([...CACHE_KEYS, ...personal])]);
  } catch (error) {
    console.warn('[HBS logout] optional cache cleanup failed', error);
  }
}
