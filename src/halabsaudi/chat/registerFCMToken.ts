// src/halabsaudi/chat/registerFCMToken.ts
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { BASE_URL } from '../../config/api';

// ✅ Same token register baar baar mat karo
let _lastRegisteredToken: string | null = null;

export async function registerFCMToken(): Promise<void> {
  try {
    const authToken = await AsyncStorage.getItem('hala_token');
    if (!authToken) return;

    // ✅ Permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[FCM] Permission not granted');
      return;
    }

    // ✅ FCM token
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      console.log('[FCM] No token received');
      return;
    }

    // ✅ Already registered — skip
    if (_lastRegisteredToken === fcmToken) {
      console.log('[FCM] Token unchanged — skipping');
      return;
    }

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    await axios.post(
      `${BASE_URL}/api/devices/register`,
      { token: fcmToken, platform },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    _lastRegisteredToken = fcmToken;
    console.log('[FCM] ✅ Token registered | platform:', platform);

    // ✅ Token refresh
    messaging().onTokenRefresh(async (newToken: string) => {
      try {
        _lastRegisteredToken = null;
        const t = await AsyncStorage.getItem('hala_token');
        if (!t) return;
        await axios.post(
          `${BASE_URL}/api/devices/register`,
          { token: newToken, platform },
          { headers: { Authorization: `Bearer ${t}` } }
        );
        _lastRegisteredToken = newToken;
        console.log('[FCM] Token refreshed');
      } catch (e) {
        console.log('[FCM] Refresh error:', e);
      }
    });

  } catch (e: any) {
    console.log('[FCM] registerFCMToken error:', e?.message || e);
  }
}

export async function unregisterFCMToken(): Promise<void> {
  try {
    const authToken = await AsyncStorage.getItem('hala_token');
    if (!authToken) return;

    const fcmToken = await messaging().getToken();
    if (!fcmToken) return;

    await axios.delete(`${BASE_URL}/api/devices/remove`, {
      data: { token: fcmToken },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    _lastRegisteredToken = null;
    console.log('[FCM] ✅ Token removed');
  } catch (e) {
    console.log('[FCM] unregisterFCMToken error:', e);
  }
}