
import { Platform, PermissionsAndroid } from 'react-native';

import messaging from '@react-native-firebase/messaging';

import notifee, { EventType } from '@notifee/react-native';

import { navigate } from './RootNavigation';



const Notifications = async ({ navigation }) => {



  // 1️⃣ Permissions

  if (Platform.OS === 'ios') {

    await messaging().requestPermission();

  }



  if (Platform.OS === 'android' && Platform.Version >= 33) {

    const granted = await PermissionsAndroid.request(

      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS

    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

  }



  // 2️⃣ Get Token

  const token = await messaging().getToken();

  console.log('FCM Token:', token);



  await fetch('http://10.0.2.2:3000/save-token', {

    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({ token }),

  });



  // 3️⃣ Create channel

  await notifee.createChannel({ id: 'default', name: 'Default Channel' });



  // 4️⃣ Foreground message

  messaging().onMessage(async remoteMessage => {

    await notifee.displayNotification({

      title: remoteMessage.data.title,

      body: remoteMessage.data.body,

      android: {

        channelId: 'default',

        pressAction: { id: 'default' },

      },

      data: remoteMessage.data,

    });

  });





  // 5️⃣ When notification tapped (background)

  messaging().onNotificationOpenedApp(remoteMessage => {

    const screen = remoteMessage?.data?.screen;

    if (screen) {

      navigation.navigate(screen);

    }

  });



  // 6️⃣ When app opened from quit state

  const initial = await messaging().getInitialNotification();

  if (initial?.data?.screen) {

    navigation.navigate(initial.data.screen);

  }



  // 7️⃣ Handle press while app in foreground (Notifee)

  notifee.onForegroundEvent(({ type, detail }) => {

    if (type === EventType.PRESS) {

      const screen = detail.notification?.data?.screen;

      if (screen) {

        navigation.navigate(screen);

      }

    }

  });

};



export default Notifications;