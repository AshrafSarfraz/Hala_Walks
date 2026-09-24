import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';
import {navigationRef} from './RootNavigation';

const PENDING_SOCIAL_KEY = 'hbs_pending_social_notification';
type SocialData = Record<string, any>;
export function isSocialNotification(data?: SocialData): boolean {
  return ['follow_request', 'follow_accepted', 'new_follower'].includes(data?.type);
}

export async function saveSocialNavigation(data?: SocialData) {
  if (isSocialNotification(data)) await AsyncStorage.setItem(PENDING_SOCIAL_KEY, JSON.stringify(data));
}

let navigating = false;
export async function openPendingSocialNotification() {
  if (navigating || !navigationRef.isReady()) return;
  navigating = true;
  try {
    const [raw, token, account] = await Promise.all([
      AsyncStorage.getItem(PENDING_SOCIAL_KEY), AsyncStorage.getItem('hala_token'), AsyncStorage.getItem('hala_user_backend'),
    ]);
    if (!raw || !token || !account) return;
    const data = JSON.parse(raw), user = JSON.parse(account);
    if (String(user._id || user.id) !== String(data.recipientId)) {
      await AsyncStorage.removeItem(PENDING_SOCIAL_KEY); return;
    }
    // Only open within an authenticated Hala stack, never over the login form.
    const root = navigationRef.getRootState();
    const hala = root.routes.find((route: any) => route.name === 'HalabStack') as any;
    if (!hala?.state?.routeNames?.includes('SocialConnections')) return;
    await AsyncStorage.removeItem(PENDING_SOCIAL_KEY);
    const destination = data.type === 'follow_request'
      ? {screen: 'SocialConnections', params: {mode: 'requests'}}
      : data.type === 'new_follower' ? {screen: 'SocialConnections', params: {mode: 'followers'}}
        : {screen: 'UserProfile', params: {participantId: data.senderId}};
    (navigationRef as any).navigate('HalabStack', destination);
  } finally {navigating = false;}
}

export async function openSocialNotification(data?: SocialData) {
  await saveSocialNavigation(data);
  await openPendingSocialNotification();
}

export async function displaySocialNotification(message: any) {
  const data = message?.data;
  if (!isSocialNotification(data)) return;
  await notifee.displayNotification({
    id: `social-${data.type}-${data.senderId}`,
    title: message.notification?.title || 'Hala community',
    body: message.notification?.body || 'You have a new follow update', data,
    android: {channelId: 'chat_messages', pressAction: {id: 'default'}, sound: 'default', autoCancel: true},
    ios: {sound: 'default', foregroundPresentationOptions: {alert: true, badge: true, sound: true, banner: true}},
  });
}
