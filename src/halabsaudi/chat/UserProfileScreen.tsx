import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import axios from 'axios';
import React,{ useCallback,useRef,useState } from 'react';
import {
FlatList,
Image,
StyleSheet,
TouchableOpacity,
View,
useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../config/api';
import { ActivityIndicator } from '../../ui/ActivityIndicator';
import { Alert } from '../../ui/Alert';
import { Text } from '../../ui/Text';
import CustomHeader from '../Component/CustomHeader/CustomHeader';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';
import UserAvatar from '../Component/UserAvatar';
import { Colors } from '../Themes/Colors';
import { fetchCollection } from '../api/collection';
import { RootState } from '../redux_toolkit/store';
import BlockUserModal from './components/BlockUserModal';
import ImageViewerModal from './components/ImageViewerModal';
import MuteModal,{ MuteDuration } from './components/MuteModal';
import { SocialPerson,canShowMessage,openSocialChat } from './socialProfile';
import { clearPeopleCache } from './startChatScreen';
import { useSocialRefresh } from './useSocialRefresh';

import { hbsText } from '../i18n/translations';

export type MediaItem = {
  id: string;
  uri: string;
  mediaType: 'image' | 'video';
  createdAt: string;
};
type Post = {
  _id: string;
  image: string;
  caption?: string;
  createdAt: string;
  location?: {name?: string};
};
type Profile = SocialPerson & {
  friendsCount: number;
  postsCount: number;
  canViewContent: boolean;
  isSelf: boolean;
  blocked: boolean;
  privacySettings?: {isPrivate?: boolean};
};

export default function UserProfileScreen({route, navigation}: any) {
  useStatusBar('dark-content', Colors.surface);
  const {participantId, participantName, chatId} = route.params || {};
  const language = useSelector((state: RootState) => state.language.language);
  const isRTL = language === 'ar';
  const {width} = useWindowDimensions();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [postsError, setPostsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [iBlocked, setIBlocked] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [muteModal, setMuteModal] = useState(false);
  const [muteDuration, setMuteDuration] = useState<MuteDuration>(null);
  const [viewer, setViewer] = useState<{
    uri: string;
    createdAt?: string;
  } | null>(null);
  const version = useRef(0);
  const clear = useCallback(() => {
    version.current++;
    setProfile(null);
    setPosts([]);
    setViewer(null);
    setLoading(true);
  }, []);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const request = ++version.current;
      const active = () => request === version.current && !signal?.aborted;
      try {
        const token = await AsyncStorage.getItem('hala_token');
        const config = {
          headers: {Authorization: `Bearer ${token}`},
          timeout: 15000,
          signal,
        };
        const {data} = await axios.get(
          `${BASE_URL}/api/users/${participantId}`,
          config,
        );
        if (!active()) return;
        setProfile(data);
        setError(false);
        setPostsError(false);
        if (!data.canViewContent) {
          setPosts([]);
          setViewer(null);
        }
        const block = await axios.get(
          `${BASE_URL}/api/block/status/${participantId}`,
          config,
        );
        if (!active()) return;
        setIBlocked(!!block.data.iBlockedThem);
        if (data.canViewContent) {
          try {
            const result = await fetchCollection(
              `${BASE_URL}/api/users/${participantId}/posts`,
              config,
              'posts',
            );
            if (active()) setPosts(result);
          } catch (e: any) {
            if (!active()) return;
            setPosts([]);
            setViewer(null);
            setPostsError(true);
            if (e.response?.status === 403)
              setProfile(prev =>
                prev ? {...prev, canViewContent: false} : null,
              );
          }
        }
        if (chatId && active()) {
          const raw = await AsyncStorage.getItem(`mute_${chatId}`);
          if (active()) setMuteDuration(raw ? JSON.parse(raw).duration : null);
        }
      } catch {
        if (active()) {
          setProfile(null);
          setPosts([]);
          setViewer(null);
          setError(true);
        }
      } finally {
        if (active()) setLoading(false);
      }
    },
    [participantId, chatId],
  );
  useSocialRefresh(load, clear);

  const respondToRequest = async (accept: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {
        headers: {Authorization: `Bearer ${token}`},
        timeout: 15000,
      };
      const url = `${BASE_URL}/api/users/friend-requests/${participantId}`;
      if (accept) await axios.post(`${url}/approve`, {}, config);
      else await axios.delete(url, config);
      clearPeopleCache();
      await load();
    } catch {
      Alert.alert('Error', 'Could not update this request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const updateFriend = async () => {
    if (!profile || busy) return;
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {
        headers: {Authorization: `Bearer ${token}`},
        timeout: 15000,
      };
      const status = profile.friendshipStatus;
      if (status === 'accepted' || status === 'outgoing') {
        const endpoint = status === 'accepted' ? 'friends' : 'friend-requests';
        await axios.delete(
          `${BASE_URL}/api/users/${endpoint}/${participantId}`,
          config,
        );
        setProfile(prev =>
          prev ? {...prev, canMessage: false, friendshipStatus: 'none'} : null,
        );
        setPosts([]);
        setViewer(null);
      } else
        await axios.post(
          `${BASE_URL}/api/users/friend-requests/${participantId}`,
          {},
          config,
        );
      clearPeopleCache();
      await load();
    } catch {
      Alert.alert('Error', 'Could not update friendship. Please try again.');
      await load();
    } finally {
      setBusy(false);
    }
  };
  const friendAction = () => {
    if (profile?.friendshipStatus !== 'accepted') {
      void updateFriend();
      return;
    }
    Alert.alert(
      hbsText(isRTL, 'ui_remove_friend'),
      hbsText(isRTL, 'ui_new_messages_will_stop_for_both_of_you_your_exis'),
      [
        {text: hbsText(isRTL, 'ui_cancel'), style: 'cancel'},
        {
          text: hbsText(isRTL, 'ui_remove_friend_2'),
          style: 'destructive',
          onPress: updateFriend,
        },
      ],
    );
  };
  const message = async () => {
    if (!profile || busy || !canShowMessage(profile)) return;
    setBusy(true);
    try {
      await openSocialChat(navigation, profile);
    } catch {
      Alert.alert(
        'Message unavailable',
        'Messaging requires an accepted friendship and both accounts to allow messages.',
      );
      await load();
    } finally {
      setBusy(false);
    }
  };
  const block = async () => {
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {
        headers: {Authorization: `Bearer ${token}`},
        timeout: 15000,
      };
      if (iBlocked)
        await axios.delete(`${BASE_URL}/api/block/${participantId}`, config);
      else
        await axios.post(`${BASE_URL}/api/block/${participantId}`, {}, config);
      setBlockModal(false);
      setViewer(null);
      setPosts([]);
      clearPeopleCache();
      await load();
    } catch {
      Alert.alert('Error', 'Could not update blocking.');
    } finally {
      setBusy(false);
    }
  };
  const changeMute = async (duration: MuteDuration) => {
    if (!chatId) return;
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {
        headers: {Authorization: `Bearer ${token}`},
        timeout: 15000,
      };
      if (duration === null) {
        await axios.delete(`${BASE_URL}/api/chat/${chatId}/mute`, config);
        await AsyncStorage.removeItem(`mute_${chatId}`);
      } else {
        await axios.post(`${BASE_URL}/api/chat/${chatId}/mute`, {}, config);
        await AsyncStorage.setItem(
          `mute_${chatId}`,
          JSON.stringify({duration, mutedAt: Date.now()}),
        );
      }
      setMuteDuration(duration);
    } catch {
      Alert.alert('Error', 'Could not save mute setting.');
    }
  };
  const sharedMedia = async () => {
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const rows = await fetchCollection(
        `${BASE_URL}/api/chat/${chatId}/media`,
        {headers: {Authorization: `Bearer ${token}`}},
        'media',
      );
      const allMedia = rows
        .filter(m => m.mediaUrl && !m.deleted)
        .map(m => ({
          id: String(m._id),
          uri: m.mediaUrl,
          mediaType: m.mediaType,
          createdAt: m.createdAt,
        }));
      navigation.navigate('AllMediaScreen', {
        chatId,
        participantName: profile?.name,
        allMedia,
      });
    } catch {
      Alert.alert('Error', 'Could not load shared media.');
    } finally {
      setBusy(false);
    }
  };
  const name = profile?.name || participantName || 'User';
  const status = profile?.friendshipStatus;
  const friendLabel =
    status === 'accepted'
      ? hbsText(isRTL, 'ui_friends')
      : status === 'outgoing'
      ? hbsText(isRTL, 'ui_cancel_request')
      : hbsText(isRTL, 'ui_add_friend');
  const header = (
    <View style={s.profile}>
      <TouchableOpacity
        disabled={!profile?.avatar}
        onPress={() => profile?.avatar && setViewer({uri: profile.avatar})}>
        <UserAvatar uri={profile?.avatar} style={s.avatar} />
      </TouchableOpacity>
      <Text style={s.name}>{name}</Text>
      <Text style={s.bio}>{profile?.bio?.trim() || ''}</Text>
      <View style={[s.counts, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
        <View style={s.count}>
          <Text style={s.number}>{profile?.postsCount ?? 0}</Text>
          <Text style={s.muted}>{hbsText(isRTL, 'ui_check_ins')}</Text>
        </View>
        <TouchableOpacity
          style={s.count}
          disabled={!profile?.canViewContent}
          accessibilityRole="button"
          onPress={() =>
            navigation.push('SocialConnections', {
              mode: 'friends',
              userId: participantId,
              profileName: name,
              isOwn: profile?.isSelf,
            })
          }>
          <Text style={s.number}>{profile?.friendsCount ?? 0}</Text>
          <Text style={s.muted}>{hbsText(isRTL, 'ui_friends_2')}</Text>
        </TouchableOpacity>
      </View>
      {profile?.isSelf ? (
        <TouchableOpacity
          style={s.button}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={s.buttonText}>
            {hbsText(isRTL, 'ui_privacy_settings')}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={s.actions}>
            {!profile?.blocked && status !== 'incoming' && (
              <TouchableOpacity
                style={s.button}
                disabled={busy}
                onPress={friendAction}>
                <Text style={s.buttonText}>{friendLabel}</Text>
              </TouchableOpacity>
            )}
            {profile && canShowMessage(profile) && (
              <TouchableOpacity
                style={[s.button, s.secondary]}
                disabled={busy}
                onPress={message}>
                <Text style={s.buttonText}>{hbsText(isRTL, 'ui_message')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {status === 'incoming' && profile && !profile.blocked && (
            <View style={{alignItems: 'center', gap: 10, marginTop: 12}}>
              <Text style={s.hint}>
                {hbsText(isRTL, 'ui_sent_you_a_friend_request')}
              </Text>
              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={s.button}
                  disabled={busy}
                  onPress={() => respondToRequest(true)}>
                  <Text style={s.buttonText}>
                    {hbsText(isRTL, 'ui_accept')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={s.button}
                  disabled={busy}
                  onPress={() => respondToRequest(false)}>
                  <Text style={s.buttonText}>
                    {hbsText(isRTL, 'ui_decline')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {status === 'outgoing' && (
            <Text style={s.hint}>
              {hbsText(
                isRTL,
                'ui_request_sent_you_can_chat_once_it_is_accepted',
              )}
            </Text>
          )}
          <TouchableOpacity
            style={s.textAction}
            onPress={() => setBlockModal(true)}>
            <Text style={s.muted}>
              {iBlocked
                ? hbsText(isRTL, 'ui_unblock')
                : hbsText(isRTL, 'ui_block_user')}
            </Text>
          </TouchableOpacity>
        </>
      )}
      {busy && <ActivityIndicator color={Colors.accent} />}
      {!!chatId && (
        <View style={s.actions}>
          <TouchableOpacity
            style={s.textAction}
            disabled={busy}
            onPress={sharedMedia}>
            <Text style={s.muted}>{hbsText(isRTL, 'ui_chat_media')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.textAction}
            onPress={() => setMuteModal(true)}>
            <Text style={s.muted}>
              {hbsText(isRTL, 'ui_chat_notifications')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={s.section}>
        <Ionicons name="grid-outline" size={18} color={Colors.textPrimary} />
        <Text style={s.sectionText}>{hbsText(isRTL, 'ui_check_ins')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <CustomHeader title={isRTL ? 'الملف الشخصي' : 'Profile'} onBackPress={() => navigation.goBack()} />
      {loading ? (
        <View style={s.empty}>
          <ActivityIndicator size="large" />
        </View>
      ) : error || !profile ? (
        <View style={s.empty}>
          <Text style={s.muted}>
            {hbsText(isRTL, 'ui_could_not_load_profile')}
          </Text>
          <TouchableOpacity style={s.button} onPress={() => load()}>
            <Text style={s.buttonText}>{hbsText(isRTL, 'ui_retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={profile.canViewContent ? posts : []}
          numColumns={3}
          keyExtractor={item => item._id}
          ListHeaderComponent={header}
          refreshing={false}
          onRefresh={() => load()}
          contentContainerStyle={{flexGrow: 1}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{width: width / 3, height: width / 3, padding: 1}}
              accessibilityLabel={item.caption || 'View post'}
              onPress={() =>
                setViewer({uri: item.image, createdAt: item.createdAt})
              }>
              <Image
                source={{uri: item.image}}
                style={s.post}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons
                name={
                  profile.canViewContent
                    ? 'images-outline'
                    : 'lock-closed-outline'
                }
                size={34}
                color={Colors.textMuted}
              />
              <Text style={s.emptyTitle}>
                {!profile.canViewContent
                  ? hbsText(isRTL, 'ui_this_account_is_private')
                  : postsError
                  ? hbsText(isRTL, 'ui_could_not_load_check_ins')
                  : hbsText(isRTL, 'ui_no_check_ins_yet')}
              </Text>
              {!profile.canViewContent && (
                <Text style={s.hint}>
                  {hbsText(
                    isRTL,
                    'ui_only_friends_can_see_private_check_ins_and_the_f',
                  )}
                </Text>
              )}
              {postsError && profile.canViewContent && (
                <TouchableOpacity style={s.textAction} onPress={() => load()}>
                  <Text style={s.buttonText}>{hbsText(isRTL, 'ui_retry')}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
      <ImageViewerModal
        visible={!!viewer}
        uri={viewer?.uri || null}
        senderName={name}
        timestamp={
          viewer?.createdAt
            ? new Date(viewer.createdAt).toLocaleDateString()
            : undefined
        }
        onClose={() => setViewer(null)}
      />
      <BlockUserModal
        visible={blockModal}
        onClose={() => setBlockModal(false)}
        onConfirm={block}
        isBlocked={iBlocked}
        participantName={name}
        loading={busy}
      />
      {!!chatId && (
        <MuteModal
          visible={muteModal}
          onClose={() => setMuteModal(false)}
          chatId={chatId}
          isMuted={muteDuration !== null}
          currentMute={muteDuration}
          onMuteChange={changeMute}
        />
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  nav: {height: 56, alignItems: 'center'},
  back: {width: 50, height: 50, alignItems: 'center', justifyContent: 'center'},
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },
  profile: {alignItems: 'center', paddingTop: 24, paddingHorizontal: 16},
  avatar: {width: 96, height: 96, borderRadius: 48},
  fallback: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {fontSize: 36, color: Colors.white},
  name: {fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginTop: 14},
  bio: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 7,
  },
  counts: {width: '100%', marginVertical: 22},
  count: {flex: 1, alignItems: 'center', minHeight: 48},
  number: {color: Colors.textPrimary, fontWeight: '800', fontSize: 20},
  muted: {color: Colors.textMuted, fontSize: 13, marginTop: 4},
  actions: {flexDirection: 'row', gap: 10, justifyContent: 'center'},
  button: {
    backgroundColor: Colors.accent,
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  secondary: {backgroundColor: Colors.surface},
  buttonText: {color: Colors.white, fontWeight: '700'},
  textAction: {minHeight: 44, padding: 10, justifyContent: 'center'},
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  section: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: Colors.surface,
    marginTop: 18,
    paddingVertical: 15,
  },
  sectionText: {color: Colors.textPrimary, fontWeight: '700'},
  post: {width: '100%', height: '100%'},
  empty: {
    flex: 1,
    minHeight: 200,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 17,
    marginTop: 14,
  },
});
