import {AlertHost} from './src/ui/Alert';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// App.tsx — ✅ Fixed: notification nav now passes participantName + participantId
import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/westwalk/redux/store';
import AppStack from './src/HandlebothApp/handleNavigation';
import notifee, { AndroidImportance, EventType, AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from './src/halabsaudi/Notifications/RootNavigation';
import { checkPendingNavigation } from './src/halabsaudi/Notifications/index';
import { connectSocket, getSocket } from './src/halabsaudi/chat/socket';
import { registerFCMToken } from './src/halabsaudi/chat/registerFCMToken';
// ✅ NEW — notification count / tray manager
import {
  displayChatNotification,
  clearChatNotifications,
  syncBadgeWithTray,
} from './src/halabsaudi/Notifications/badge';

const CHAT_CHANNEL_ID = 'chat_messages';

async function createChatChannel() {
  await notifee.createChannel({
    id: CHAT_CHANNEL_ID,
    name: 'Chat Messages',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
  });
}

async function requestNotificationPermission() {
  try {
    const settings = await notifee.getNotificationSettings();
    if (
      settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED ||
      settings.authorizationStatus === AuthorizationStatus.DENIED
    ) {
      await notifee.requestPermission();
    }
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const { PermissionsAndroid } = require('react-native');
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
  } catch (e) {
    console.log('[App] Notification permission error:', e);
  }
}

// ✅ Helper — navigate to chat with all available params from notification data
function navigateToChat(data: Record<string, any> | undefined, delay = 0) {
  if (!data?.chatId) return;
  // ✅ FIX: notification par tap karne ke baad wo tray me na rahe
  clearChatNotifications(String(data.chatId));
  const params = {
    chatId: String(data.chatId),
    participantName: data.senderName || data.participantName || '',
    participantId: String(data.senderId || data.participantId || ''),
    participantAvatar: data.senderAvatar || null,           
  };
  if (delay > 0) {
    setTimeout(() => navigate('ChatScreen', params), delay);
  } else {
    navigate('ChatScreen', params);
  }
}

const App = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    requestNotificationPermission();
    createChatChannel();
    checkPendingNavigation();

    const initSocket = async () => {
      const token = await AsyncStorage.getItem('hala_token');
      if (token) {
        connectSocket(token);
        await registerFCMToken();
      }
    };
    initSocket();

    const appStateSub = AppState.addEventListener('change', async nextState => {
      const token = await AsyncStorage.getItem('hala_token');
      if (!token) return;

      if (nextState === 'active' && appState.current !== 'active') {
        const socket = getSocket();
        if (socket && !socket.connected) {
          connectSocket(token);
          socket.connect();
        }
        await registerFCMToken();
        // ✅ FIX: agar user ne notifications khud swipe kar di hon to badge
        //    bhi utna kam ho jaye. Pehle badge atka rehta tha.
        await syncBadgeWithTray();
      }
      appState.current = nextState;
    });

    // ✅ App CLOSED → tap notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data?.chatId) {
          navigateToChat(remoteMessage.data, 1500);
        }
      });

    // ✅ App BACKGROUND → tap notification
    const unsubscribeFCMBackground = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage?.data?.chatId) {
          navigateToChat(remoteMessage.data);
        }
      },
    );

    // ✅ FOREGROUND — show via notifee
    const unsubscribeFCMForeground = messaging().onMessage(
      async remoteMessage => {
        try {
          await createChatChannel();
          const chatId = remoteMessage?.data?.chatId;
          if (!chatId) return;

          // ✅ FIX: pehle yahan seedha notifee.displayNotification() tha,
          //    bina `id` ke. Bina id ke notifee HAR BAAR NAYI notification
          //    banata hai — 20 message = tray me 20 notifications, aur
          //    count kabhi khatam nahi hota tha.
          //
          //    displayChatNotification() fixed id `chat-<chatId>` use karta
          //    hai, is liye nayi notification purani ko REPLACE kar deti hai.
          await displayChatNotification({
            chatId: String(chatId),
            title: remoteMessage?.notification?.title || 'New Message',
            body: remoteMessage?.notification?.body || 'You have a new message',
            senderId: String(remoteMessage?.data?.senderId || ''),
            senderName: String(remoteMessage?.data?.senderName || ''),
            senderAvatar: String(remoteMessage?.data?.senderAvatar || ''),
            channelId: CHAT_CHANNEL_ID,
          });
        } catch (e) {
          console.log('[FCM] Foreground error:', e);
        }
      },
    );

    // ✅ Notifee tap handler (foreground)
    const unsubscribeForeground = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (type === EventType.PRESS) {
          const d = detail.notification?.data;
          if (d?.chatId) navigateToChat(d);
          if (d?.venueId) navigate('SelectedVenue', { venueId: d.venueId });
        }
      },
    );

    return () => {
      appStateSub.remove();
      unsubscribeFCMBackground();
      unsubscribeFCMForeground();
      unsubscribeForeground();
    };
  }, []);

  return (
    <SafeAreaProvider><Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppStack />
        <AlertHost />
      </PersistGate>
    </Provider></SafeAreaProvider>
  );
};

export default App;
