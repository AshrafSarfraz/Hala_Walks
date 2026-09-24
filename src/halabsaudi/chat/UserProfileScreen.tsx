import UserAvatar from '../Component/UserAvatar';
import React, {useCallback, useRef, useState} from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, Image, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../ui/Text';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {Alert} from '../../ui/Alert';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {RootState} from '../redux_toolkit/store';
import {fetchCollection} from '../api/collection';
import {useStatusBar} from '../Component/UseStatusBar/useStatusBar';
import ImageViewerModal from './components/ImageViewerModal';
import BlockUserModal from './components/BlockUserModal';
import MuteModal, {MuteDuration} from './components/MuteModal';
import {SocialPerson, canShowMessage, openSocialChat} from './socialProfile';
import {useSocialRefresh} from './useSocialRefresh';
import {clearPeopleCache} from './startChatScreen';

export type MediaItem = {id: string; uri: string; mediaType: 'image' | 'video'; createdAt: string};
type Post = {_id: string; image: string; caption?: string; createdAt: string; location?: {name?: string}};
type Profile = SocialPerson & {followersCount: number; followingCount: number; postsCount: number;
  canViewContent: boolean; isSelf: boolean; blocked: boolean; privacySettings?: {isPrivate?: boolean}};

export default function UserProfileScreen({route, navigation}: any) {
  useStatusBar('light-content', Colors.darkgrey);
  const {participantId, participantName, chatId} = route.params || {};
  const language = useSelector((state: RootState) => state.language.language);
  const isRTL = language === 'ar';
  const label = (en: string, ar: string) => isRTL ? ar : en;
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
  const [viewer, setViewer] = useState<{uri: string; createdAt?: string} | null>(null);
  const version = useRef(0);
  const clear = useCallback(() => {
    version.current++; setProfile(null); setPosts([]); setViewer(null); setLoading(true);
  }, []);
  const load = useCallback(async (signal?: AbortSignal) => {
    const request = ++version.current;
    const active = () => request === version.current && !signal?.aborted;
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal};
      const {data} = await axios.get(`${BASE_URL}/api/users/${participantId}`, config);
      if (!active()) return;
      setProfile(data); setError(false); setPostsError(false);
      if (!data.canViewContent) {setPosts([]); setViewer(null);}
      const block = await axios.get(`${BASE_URL}/api/block/status/${participantId}`, config);
      if (!active()) return;
      setIBlocked(!!block.data.iBlockedThem);
      if (data.canViewContent) {
        try {
          const result = await fetchCollection(`${BASE_URL}/api/users/${participantId}/posts`, config, 'posts');
          if (active()) setPosts(result);
        } catch (e: any) {
          if (!active()) return;
          setPosts([]); setViewer(null); setPostsError(true);
          if (e.response?.status === 403) setProfile(prev => prev ? {...prev, canViewContent: false} : null);
        }
      }
      if (chatId && active()) {
        const raw = await AsyncStorage.getItem(`mute_${chatId}`);
        if (active()) setMuteDuration(raw ? JSON.parse(raw).duration : null);
      }
    } catch {
      if (active()) {setProfile(null); setPosts([]); setViewer(null); setError(true);}
    } finally {if (active()) setLoading(false);}
  }, [participantId, chatId]);
  useSocialRefresh(load, clear);

  const respondToRequest = async (accept: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000};
      const url = `${BASE_URL}/api/users/follow-requests/${participantId}`;
      if (accept) await axios.post(`${url}/approve`, {}, config);
      else await axios.delete(url, config);
      clearPeopleCache();
      await load();
    } catch {Alert.alert('Error', 'Could not update this request. Please try again.');}
    finally {setBusy(false);}
  };

  const follow = async () => {
    if (!profile || busy) return;
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000};
      const status = profile.relationship?.followingStatus;
      if (status === 'accepted' || status === 'pending') {
        // Clear restricted content immediately when giving up access.
        setProfile(prev => prev ? {...prev, canMessage: false, canViewContent: !prev.privacySettings?.isPrivate} : null);
        setPosts([]); setViewer(null);
        await axios.delete(`${BASE_URL}/api/users/follow/${participantId}`, config);
      } else await axios.post(`${BASE_URL}/api/users/follow/${participantId}`, {}, config);
      clearPeopleCache(); await load();
    } catch {Alert.alert('Error', 'Could not update follow status. Please try again.'); await load();}
    finally {setBusy(false);}
  };
  const message = async () => {
    if (!profile || busy || !canShowMessage(profile)) return;
    setBusy(true);
    try {await openSocialChat(navigation, profile);}
    catch {Alert.alert('Message unavailable', 'Messaging requires mutual following and both accounts to allow messages.'); await load();}
    finally {setBusy(false);}
  };
  const block = async () => {
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000};
      if (iBlocked) await axios.delete(`${BASE_URL}/api/block/${participantId}`, config);
      else await axios.post(`${BASE_URL}/api/block/${participantId}`, {}, config);
      setBlockModal(false); setViewer(null); setPosts([]); clearPeopleCache(); await load();
    } catch {Alert.alert('Error', 'Could not update blocking.');}
    finally {setBusy(false);}
  };
  const changeMute = async (duration: MuteDuration) => {
    if (!chatId) return;
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000};
      if (duration === null) {
        await axios.delete(`${BASE_URL}/api/chat/${chatId}/mute`, config);
        await AsyncStorage.removeItem(`mute_${chatId}`);
      } else {
        await axios.post(`${BASE_URL}/api/chat/${chatId}/mute`, {}, config);
        await AsyncStorage.setItem(`mute_${chatId}`, JSON.stringify({duration, mutedAt: Date.now()}));
      }
      setMuteDuration(duration);
    } catch {Alert.alert('Error', 'Could not save mute setting.');}
  };
  const sharedMedia = async () => {
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const rows = await fetchCollection(`${BASE_URL}/api/chat/${chatId}/media`, {headers: {Authorization: `Bearer ${token}`}}, 'media');
      const allMedia = rows.filter(m => m.mediaUrl && !m.deleted).map(m => ({id: String(m._id), uri: m.mediaUrl, mediaType: m.mediaType, createdAt: m.createdAt}));
      navigation.navigate('AllMediaScreen', {chatId, participantName: profile?.name, allMedia});
    } catch {Alert.alert('Error', 'Could not load shared media.');}
    finally {setBusy(false);}
  };
  const name = profile?.name || participantName || 'User';
  const status = profile?.relationship?.followingStatus;
  const followLabel = status === 'accepted' ? label('Following', 'تتابعه') : status === 'pending' ? label('Requested', 'تم الطلب')
    : profile?.relationship?.followedByStatus === 'accepted' ? label('Follow back', 'متابعة بالمثل') : label('Follow', 'متابعة');
  const header = <View style={s.profile}>
    <TouchableOpacity disabled={!profile?.avatar} onPress={() => profile?.avatar && setViewer({uri: profile.avatar})}>
      <UserAvatar uri={profile?.avatar} style={s.avatar} />
    </TouchableOpacity>
    <Text style={s.name}>{name}</Text>
    <Text style={s.bio}>{profile?.bio?.trim() || 'null'}</Text>
    <View style={[s.counts, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
      <View style={s.count}><Text style={s.number}>{profile?.postsCount ?? 0}</Text><Text style={s.muted}>{label('Posts', 'منشورات')}</Text></View>
      {(['followers', 'following'] as const).map(mode => <TouchableOpacity key={mode} style={s.count}
        disabled={!profile?.canViewContent} accessibilityRole="button" accessibilityState={{disabled: !profile?.canViewContent}}
        onPress={() => navigation.push('SocialConnections', {mode, userId: participantId, profileName: name, isOwn: profile?.isSelf})}>
        <Text style={s.number}>{mode === 'followers' ? profile?.followersCount ?? 0 : profile?.followingCount ?? 0}</Text>
        <Text style={s.muted}>{mode === 'followers' ? label('Followers', 'متابعون') : label('Following', 'يتابع')}</Text>
      </TouchableOpacity>)}
    </View>
    {profile?.isSelf ? <TouchableOpacity style={s.button} onPress={() => navigation.navigate('Settings')}><Text style={s.buttonText}>{label('Privacy settings', 'إعدادات الخصوصية')}</Text></TouchableOpacity> : <>
      <View style={s.actions}>
        {!profile?.blocked && <TouchableOpacity style={s.button} disabled={busy} onPress={follow}><Text style={s.buttonText}>{followLabel}</Text></TouchableOpacity>}
        {profile && canShowMessage(profile) && <TouchableOpacity style={[s.button, s.secondary]} disabled={busy} onPress={message}><Text style={s.buttonText}>{label('Message', 'رسالة')}</Text></TouchableOpacity>}
      </View>
      {profile?.relationship?.followedByStatus === 'pending' && !profile.blocked && <View style={{alignItems: 'center', gap: 10, marginTop: 12}}>
        <Text style={s.hint}>{label('Wants to follow you', 'يرغب بمتابعتك')}</Text>
        <View style={{flexDirection: 'row', gap: 12}}>
          <TouchableOpacity accessibilityRole="button" style={s.button} disabled={busy} onPress={() => respondToRequest(true)}><Text style={s.buttonText}>{label('Accept', 'قبول')}</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={s.button} disabled={busy} onPress={() => respondToRequest(false)}><Text style={s.buttonText}>{label('Decline', 'رفض')}</Text></TouchableOpacity>
        </View>
      </View>}
      {status === 'pending' && <Text style={s.hint}>{label('Waiting for approval. Messaging also requires a follow back.', 'بانتظار الموافقة. المراسلة تتطلب المتابعة المتبادلة أيضاً.')}</Text>}
      {status === 'accepted' && profile?.relationship?.followedByStatus !== 'accepted' && <Text style={s.hint}>{label('Messaging becomes available when they follow you back.', 'تتوفر المراسلة عندما يتابعك هذا المستخدم أيضاً.')}</Text>}
      <TouchableOpacity style={s.textAction} onPress={() => setBlockModal(true)}><Text style={s.muted}>{iBlocked ? label('Unblock', 'إلغاء الحظر') : label('Block user', 'حظر المستخدم')}</Text></TouchableOpacity>
    </>}
    {busy && <ActivityIndicator color={Colors.btnRed} />}
    {!!chatId && <View style={s.actions}>
      <TouchableOpacity style={s.textAction} disabled={busy} onPress={sharedMedia}><Text style={s.muted}>{label('Chat media', 'وسائط المحادثة')}</Text></TouchableOpacity>
      <TouchableOpacity style={s.textAction} onPress={() => setMuteModal(true)}><Text style={s.muted}>{label('Chat notifications', 'إشعارات المحادثة')}</Text></TouchableOpacity>
    </View>}
    <View style={s.section}><Ionicons name="grid-outline" size={18} color={Colors.White} /><Text style={s.sectionText}>{label('Posts', 'منشورات')}</Text></View>
  </View>;

  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
    <View style={[s.nav, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
      <TouchableOpacity accessibilityLabel="Back" style={s.back} onPress={() => navigation.goBack()}><Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={Colors.White} /></TouchableOpacity>
      <Text style={s.title} numberOfLines={1}>{name}</Text><View style={s.back} />
    </View>
    {loading ? <View style={s.empty}><ActivityIndicator size="large" /></View> : error || !profile ? <View style={s.empty}><Text style={s.muted}>{label('Could not load profile.', 'تعذر تحميل الملف الشخصي.')}</Text><TouchableOpacity style={s.button} onPress={() => load()}><Text style={s.buttonText}>{label('Retry', 'إعادة المحاولة')}</Text></TouchableOpacity></View> :
      <FlatList data={profile.canViewContent ? posts : []} numColumns={3} keyExtractor={item => item._id}
        ListHeaderComponent={header} refreshing={false} onRefresh={() => load()} contentContainerStyle={{flexGrow: 1}}
        renderItem={({item}) => <TouchableOpacity style={{width: width / 3, height: width / 3, padding: 1}} accessibilityLabel={item.caption || 'View post'} onPress={() => setViewer({uri: item.image, createdAt: item.createdAt})}>
          <Image source={{uri: item.image}} style={s.post} resizeMode="cover" />
        </TouchableOpacity>}
        ListEmptyComponent={<View style={s.empty}>
          <Ionicons name={profile.canViewContent ? 'images-outline' : 'lock-closed-outline'} size={34} color={Colors.Grey9} />
          <Text style={s.emptyTitle}>{!profile.canViewContent ? label('This account is private', 'هذا الحساب خاص') : postsError ? label('Could not load posts', 'تعذر تحميل المنشورات') : label('No posts yet', 'لا توجد منشورات بعد')}</Text>
          {!profile.canViewContent && <Text style={s.hint}>{label('Only approved followers can see posts and follower/following lists.', 'يمكن للمتابعين الموافق عليهم فقط رؤية المنشورات وقوائم المتابعين والمتابَعين.')}</Text>}
          {postsError && profile.canViewContent && <TouchableOpacity style={s.textAction} onPress={() => load()}><Text style={s.buttonText}>{label('Retry', 'إعادة المحاولة')}</Text></TouchableOpacity>}
        </View>} />}
    <ImageViewerModal visible={!!viewer} uri={viewer?.uri || null} senderName={name} timestamp={viewer?.createdAt ? new Date(viewer.createdAt).toLocaleDateString() : undefined} onClose={() => setViewer(null)} />
    <BlockUserModal visible={blockModal} onClose={() => setBlockModal(false)} onConfirm={block} isBlocked={iBlocked} participantName={name} loading={busy} />
    {!!chatId && <MuteModal visible={muteModal} onClose={() => setMuteModal(false)} chatId={chatId} isMuted={muteDuration !== null} currentMute={muteDuration} onMuteChange={changeMute} />}
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.dargBg}, nav: {height: 56, alignItems: 'center', backgroundColor: Colors.darkgrey}, back: {width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}, title: {flex: 1, textAlign: 'center', color: Colors.White, fontWeight: '700', fontSize: 17},
  profile: {alignItems: 'center', paddingTop: 24, paddingHorizontal: 16}, avatar: {width: 96, height: 96, borderRadius: 48}, fallback: {backgroundColor: Colors.darkgrey, alignItems: 'center', justifyContent: 'center'}, initial: {fontSize: 36, color: Colors.White}, name: {fontSize: 22, fontWeight: '800', color: Colors.White, marginTop: 14}, bio: {fontSize: 14, lineHeight: 21, color: Colors.Grey9, textAlign: 'center', marginTop: 7},
  counts: {width: '100%', marginVertical: 22}, count: {flex: 1, alignItems: 'center', minHeight: 48}, number: {color: Colors.White, fontWeight: '800', fontSize: 20}, muted: {color: Colors.Grey9, fontSize: 13, marginTop: 4},
  actions: {flexDirection: 'row', gap: 10, justifyContent: 'center'}, button: {backgroundColor: Colors.btnRed, minHeight: 44, minWidth: 120, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginVertical: 6}, secondary: {backgroundColor: Colors.darkgrey}, buttonText: {color: Colors.White, fontWeight: '700'}, textAction: {minHeight: 44, padding: 10, justifyContent: 'center'}, hint: {color: Colors.Grey9, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10},
  section: {flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', width: '100%', borderBottomWidth: 1, borderColor: Colors.darkgrey, marginTop: 18, paddingVertical: 15}, sectionText: {color: Colors.White, fontWeight: '700'}, post: {width: '100%', height: '100%'}, empty: {flex: 1, minHeight: 200, padding: 30, justifyContent: 'center', alignItems: 'center'}, emptyTitle: {color: Colors.White, fontWeight: '700', fontSize: 17, marginTop: 14},
});
