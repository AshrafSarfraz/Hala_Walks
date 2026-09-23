import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config/api';

export type SocialPerson = {
  _id: string; name: string; avatar?: string | null; bio?: string | null;
  canMessage?: boolean;
  relationship?: {followingStatus?: string; followedByStatus?: string};
};
export function bioPreview(bio?: string | null): string {
  const words = (bio || '').trim().split(/\s+/).filter(Boolean);
  return words.length ? words.slice(0, 40).join(' ') + (words.length > 40 ? '…' : '') : 'null';
}
export function canShowMessage(user: SocialPerson): boolean {
  return user.canMessage === true && user.relationship?.followingStatus === 'accepted'
    && user.relationship?.followedByStatus === 'accepted';
}
export async function openSocialChat(navigation: any, user: SocialPerson) {
  const token = await AsyncStorage.getItem('hala_token');
  // No offline fallback: the backend must confirm current mutual following.
  const {data: chat} = await axios.post(`${BASE_URL}/api/chat/with/${user._id}`, {}, {
    headers: {Authorization: `Bearer ${token}`}, timeout: 15000,
  });
  navigation.navigate('ChatScreen', {chatId: chat._id, participantId: user._id,
    participantName: user.name, participantAvatar: user.avatar || null,
    participantHidesOnline: chat.participantHidesOnline,
    participantHidesLastSeen: chat.participantLastSeen === null});
}
