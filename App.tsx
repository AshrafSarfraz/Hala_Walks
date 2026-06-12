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

          await notifee.displayNotification({
            title: remoteMessage?.notification?.title || 'New Message',
            body: remoteMessage?.notification?.body || 'You have a new message',
            data: {
              chatId: String(chatId),
              senderId: String(remoteMessage?.data?.senderId || ''),
              // ✅ Include name so tapping foreground notif also works
              senderName: String(remoteMessage?.data?.senderName || ''),
              senderAvatar: String(remoteMessage?.data?.senderAvatar || ''),
            },
            android: {
              channelId: CHAT_CHANNEL_ID,
              importance: AndroidImportance.HIGH,
              pressAction: { id: 'default' },
              showTimestamp: true,
            },
            ios: {
              sound: 'default',
              foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
                banner: true,
              },
            },
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppStack />
      </PersistGate>
    </Provider>
  );
};

export default App;









// // App.tsx
// import 'react-native-gesture-handler';
// import React, { useEffect, useRef } from 'react';
// import { AppState, Platform } from 'react-native';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { persistor, store } from './src/westwalk/redux/store';
// import AppStack from './src/HandlebothApp/handleNavigation';
// import notifee, { AndroidImportance, EventType, AuthorizationStatus } from '@notifee/react-native';
// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { navigate } from './src/halabsaudi/Notifications/RootNavigation';
// import { checkPendingNavigation } from './src/halabsaudi/Notifications/index';
// import { connectSocket, getSocket } from './src/halabsaudi/chat/socket';
// import { registerFCMToken } from './src/halabsaudi/chat/registerFCMToken';

// const CHAT_CHANNEL_ID = 'chat_messages';

// async function createChatChannel() {
//   await notifee.createChannel({
//     id: CHAT_CHANNEL_ID,
//     name: 'Chat Messages',
//     importance: AndroidImportance.HIGH,
//     vibration: true,
//     sound: 'default',
//   });
// }

// async function requestNotificationPermission() {
//   try {
//     const settings = await notifee.getNotificationSettings();
//     if (
//       settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED ||
//       settings.authorizationStatus === AuthorizationStatus.DENIED
//     ) {
//       await notifee.requestPermission();
//     }
//     if (Platform.OS === 'android' && Platform.Version >= 33) {
//       const { PermissionsAndroid } = require('react-native');
//       await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//       );
//     }
//   } catch (e) {
//     console.log('[App] Notification permission error:', e);
//   }
// }

// const App = () => {
//   const appState = useRef(AppState.currentState);

//   useEffect(() => {
//     requestNotificationPermission();
//     createChatChannel();
//     checkPendingNavigation();

//     const initSocket = async () => {
//       const token = await AsyncStorage.getItem('hala_token');
//       if (token) {
//         connectSocket(token);
//         await registerFCMToken();
//       }
//     };
//     initSocket();

//     const appStateSub = AppState.addEventListener('change', async (nextState) => {
//       const token = await AsyncStorage.getItem('hala_token');
//       if (!token) return;

//       if (nextState === 'active' && appState.current !== 'active') {
//         const socket = getSocket();
//         if (socket && !socket.connected) {
//           connectSocket(token);
//           socket.connect();
//         }
//         await registerFCMToken();
//         console.log('[App] Foreground — socket reconnected');
//       }
//       appState.current = nextState;
//     });

//     // App CLOSED → click
//     messaging().getInitialNotification().then(remoteMessage => {
//       if (remoteMessage?.data?.chatId) {
//         setTimeout(() => navigate('ChatScreen', { chatId: remoteMessage.data?.chatId }), 1500);
//       }
//     });

//     // BACKGROUND → click
//     const unsubscribeFCMBackground = messaging().onNotificationOpenedApp(remoteMessage => {
//       if (remoteMessage?.data?.chatId) {
//         navigate('ChatScreen', { chatId: remoteMessage.data?.chatId });
//       }
//     });

//     // ✅ FOREGROUND — notifee se show karo, NO smallIcon
//     const unsubscribeFCMForeground = messaging().onMessage(async remoteMessage => {
//       try {
//         await createChatChannel();
//         const chatId = remoteMessage?.data?.chatId;
//         if (!chatId) return;

//         await notifee.displayNotification({
//           title: remoteMessage?.notification?.title || 'New Message',
//           body:  remoteMessage?.notification?.body  || 'You have a new message',
//           data:  {
//             chatId:   String(chatId),
//             senderId: String(remoteMessage?.data?.senderId || ''),
//           },
//           android: {
//             channelId:   CHAT_CHANNEL_ID,
//             importance:  AndroidImportance.HIGH,
//             pressAction: { id: 'default' },
//             showTimestamp: true,
//           },
//           ios: {
//             sound: 'default',
//             foregroundPresentationOptions: { alert: true, badge: true, sound: true, banner: true },
//           },
//         });
//         console.log('[FCM] ✅ Foreground notification shown');
//       } catch (e) {
//         console.log('[FCM] Foreground error:', e);
//       }
//     });

//     // Notifee click handler
//     const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
//       if (type === EventType.PRESS) {
//         const chatId  = detail.notification?.data?.chatId;
//         const venueId = detail.notification?.data?.venueId;
//         if (chatId)  navigate('ChatScreen', { chatId });
//         if (venueId) navigate('SelectedVenue', { venueId });
//       }
//     });

//     return () => {
//       appStateSub.remove();
//       unsubscribeFCMBackground();
//       unsubscribeFCMForeground();
//       unsubscribeForeground();
//     };
//   }, []);

//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <AppStack />
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;




// // App.tsx
// import 'react-native-gesture-handler';
// import React, { useEffect } from 'react';
// import { Platform } from 'react-native';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { persistor, store } from './src/westwalk/redux/store';
// import AppStack from './src/HandlebothApp/handleNavigation';
// import notifee, { EventType, AuthorizationStatus } from '@notifee/react-native';
// import messaging from '@react-native-firebase/messaging';
// import { navigate } from './src/halabsaudi/Notifications/RootNavigation';
// import { checkPendingNavigation } from './src/halabsaudi/Notifications/index';

// // ✅ Notification permission — app install hote hi maango (sirf ek baar)
// async function requestNotificationPermission() {
//   try {
//     const settings = await notifee.getNotificationSettings();

//     if (settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED ||
//         settings.authorizationStatus === AuthorizationStatus.DENIED) {
//       await notifee.requestPermission();
//     }

//     // Android 13+
//     if (Platform.OS === 'android' && Platform.Version >= 33) {
//       const { PermissionsAndroid } = require('react-native');
//       await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//       );
//     }
//   } catch (e) {
//     console.log('[App] Notification permission error:', e);
//   }
// }

// const App = () => {
//   useEffect(() => {
//     // ✅ 1. Notification permission — app open hote hi
//     requestNotificationPermission();

//     // ✅ 2. Pending venue navigation check (background/killed notification press)
//     checkPendingNavigation();

//     // ✅ 3. FCM — App CLOSED state → notification click
//     messaging()
//       .getInitialNotification()
//       .then(remoteMessage => {
//         if (remoteMessage?.data?.chatId) {
//           setTimeout(() => {
//             navigate('ChatScreen', { chatId: remoteMessage.data?.chatId });
//           }, 1000);
//         }
//       });

//     // ✅ 4. FCM — BACKGROUND state → notification click
//     const unsubscribeFCMBackground = messaging().onNotificationOpenedApp(remoteMessage => {
//       if (remoteMessage?.data?.chatId) {
//         navigate('ChatScreen', { chatId: remoteMessage.data?.chatId });
//       }
//     });

//     // ✅ 5. Notifee — FOREGROUND → notification click (venue or chat)
//     const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
//       if (type === EventType.PRESS) {
//         const chatId   = detail.notification?.data?.chatId;
//         const venueId  = detail.notification?.data?.venueId;

//         if (chatId)  navigate('ChatScreen', { chatId });
//         if (venueId) navigate('SelectedVenue', { venueId });
//       }
//     });

//     return () => {
//       unsubscribeFCMBackground();
//       unsubscribeForeground();
//     };
//   }, []);

//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <AppStack />
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;



