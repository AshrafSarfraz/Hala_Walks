import FollowRequestsButton from './components/FollowRequestsButton';
import UserAvatar from '../Component/UserAvatar';
import {Text} from '../../ui/Text';
import {fetchCollection} from '../api/collection';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
// src/halabsaudi/chat/conversationScreen.tsx
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {View, FlatList, TouchableOpacity, StyleSheet, Image, StatusBar, RefreshControl, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import {useSelector} from 'react-redux';
import {Colors} from '../Themes/Colors';
import {chatMessage} from '../Themes/Images';
import {BASE_URL} from '../../config/api';
import {getSocket} from './socket';
import ConversationHeader from './components/ChatHeaders/conversation';
import DeleteConversation from './deleteconversation';
import {languageData} from '../redux_toolkit/language/languageSlice';
import {RootState} from '../redux_toolkit/store';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';
// ✅ backend ab { chats, hasMore } deta hai — array nahi
import {unwrapChats} from '../api/unwrap';
// ✅ app icon ka badge
import {setBadgeFromChats, clearChatNotifications} from '../Notifications/badge';

type Conversation = {
  _id: string;
  participant: {_id: string; name: string; avatar?: string | null};
  // ✅ FIX: pehle yahan sirf {text, sender, deleted} tha. Media fields
  //    the hi nahi — is liye image message list me KHALI dikhta tha.
  lastMessage: {
    text: string;
    sender?: {_id: string};
    deleted?: boolean;
    mediaType?: 'image' | 'video' | 'audio' | 'document' | null;
    mediaUrl?: string | null;
    thumbnailUrl?: string | null;
  } | null;
  lastMessageAt: string;
  unreadCount: number;
  isMuted?: boolean;
  participantLastSeen?: string | null;
  participantHidesOnline?: boolean;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function sortByRecent(list: Conversation[]): Conversation[] {
  return [...list].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

const CACHE_KEY      = 'hala_conversations';
const CACHE_DURATION = 5 * 60 * 1000;

let _writeTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(data: Conversation[]) {
  if (_writeTimer) clearTimeout(_writeTimer);
  _writeTimer = setTimeout(() => {
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
  }, 600);
}

export default function ConversationsScreen({navigation}: any) {
  useStatusBar('light-content', Colors.Green, true);
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [myname,        setMyname]        = useState('');
  const [deletingChat,  setDeletingChat]  = useState<Conversation | null>(null);

  const currentUserIdRef = useRef('');
  const tokenRef         = useRef('');
  const lastLoadedRef    = useRef<number>(0);
  const insets           = useSafeAreaInsets();

  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  useFocusEffect(useCallback(() => {
    let active = true;
    AsyncStorage.getItem('hala_user_backend').then(raw => {
      if (active && raw) {const user = JSON.parse(raw); setMyAvatar(user.avatar || null); setMyname(user.name || '');}
    }).catch(() => {});
    return () => {active = false;};
  }, []));

  // Init
  useEffect(() => {
    const init = async () => {
      try {
        const [tok, cachedRaw] = await Promise.all([
          AsyncStorage.getItem('hala_token'),
          AsyncStorage.getItem(CACHE_KEY),
        ]);

        if (cachedRaw) {
          try {
            const cached: Conversation[] = JSON.parse(cachedRaw);
            setConversations(cached);
            setLoading(false);
          } catch {}
        }

        if (!tok) { setLoading(false); return; }
        tokenRef.current = tok;

        try {
          const decoded: any = jwtDecode(tok);
          const myId = String(decoded._id || decoded.id || '');
          setCurrentUserId(myId);
          currentUserIdRef.current = myId;
          setMyname(decoded.name || '');
        } catch {}

        if (!cachedRaw) {
          await fetchChats(true);
        } else {
          fetchChats(false);
        }
      } catch (err) {
        console.log('[ConvScreen] init error:', err);
        setLoading(false);
      }
    };
    init();
  }, []);

  // fetchChats — force=true bypasses cache
  const fetchChats = useCallback(async (showLoader: boolean, force = false) => {
    const tok = tokenRef.current;
    if (!tok) { setLoading(false); setRefreshing(false); return; }

    const now = Date.now();
    if (!force && !showLoader && now - lastLoadedRef.current < CACHE_DURATION) {
      setLoading(false); setRefreshing(false); return;
    }

    if (showLoader) setLoading(true);

    try {
      const chatItems = await fetchCollection(`${BASE_URL}/api/chat`, {
        headers: {Authorization: `Bearer ${tok}`},
        timeout: 15000,
      }, 'chats');
      // ✅ FIX: pehle `(res.data || []).map(...)` tha. Naya backend object
      //    bhejta hai ({chats: [...]}) — object par .map crash karta tha
      //    aur list khali reh jati thi.
      const sorted: Conversation[] = sortByRecent(
        chatItems.map((c: any) => ({...c, unreadCount: c.unreadCount ?? 0})),
      );
      lastLoadedRef.current = Date.now();
      setConversations(sorted);
      setLoadError(false);
      debouncedSave(sorted);
      // ✅ badge hamesha asli unread counts se — atak nahi sakta
      setBadgeFromChats(sorted);
    } catch (err: any) {
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (tokenRef.current) fetchChats(false);
  }, [fetchChats]));

  // Socket
  const handleChatUpdatedRef = useRef<(data: any) => void>(() => {});
  handleChatUpdatedRef.current = (data: any) => {
    setConversations(prev => {
      const chatExists = prev.some(c => c._id === data.chatId);
      if (!chatExists) {
        fetchChats(false, true);
        return prev;
      }
      const updated = prev.map(chat => {
        if (chat._id !== data.chatId) return chat;
        const newUnread =
          data.unreadCount !== undefined ? data.unreadCount
          : data.incrementUnread         ? (chat.unreadCount || 0) + 1
          : chat.unreadCount;
        return {...chat, lastMessage: data.lastMessage, lastMessageAt: data.lastMessageAt, unreadCount: newUnread};
      });
      const sorted = sortByRecent(updated);
      debouncedSave(sorted);
      return sorted;
    });
  };

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const stableHandler = (data: any) => handleChatUpdatedRef.current(data);
    const register = () => {
      const socket = getSocket();
      if (!socket) { retryTimer = setTimeout(register, 500); return; }
      socket.off('chat-updated', stableHandler);
      socket.on('chat-updated', stableHandler);
    };
    register();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      getSocket()?.off('chat-updated', stableHandler);
    };
  }, []);

  const filtered = useMemo(() =>
    conversations
      .filter(c => c.lastMessage !== null && c.lastMessage !== undefined)
      .filter(c =>
        !searchQuery.trim() ? true
          : c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  );

  const openChat = useCallback((chat: Conversation) => {
    // ✅ chat kholte hi us chat ki notifications tray se hatao
    clearChatNotifications(chat._id);

    setConversations(prev => {
      const updated = prev.map(c => c._id === chat._id ? {...c, unreadCount: 0} : c);
      setBadgeFromChats(updated);   // badge foran update
      return updated;
    });
    navigation.navigate('ChatScreen', {
      chatId:                   chat._id,
      participantName:          chat.participant?.name   || 'User',
      participantId:            chat.participant?._id    || '',
      participantAvatar:        chat.participant?.avatar || null,
      participantHidesOnline:   chat.participantHidesOnline   || false,
      participantHidesLastSeen: chat.participantLastSeen === null,
    });
  }, [navigation]);

  const deleteConversation = useCallback(async (chatId: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c._id !== chatId);
      debouncedSave(updated);
      return updated;
    });
    try {
      await axios.delete(`${BASE_URL}/api/chat/${chatId}`, {
        headers: {Authorization: `Bearer ${tokenRef.current}`}, timeout: 10000,
      });
    } catch {
      fetchChats(false, true);
    }
  }, [fetchChats]);

  const renderItem = useCallback(({item}: {item: Conversation}) => {
    const name        = item.participant?.name   || 'User';
    const avatarUri   = item.participant?.avatar || null;
    const isDeleted   = item.lastMessage?.deleted;
    // ✅ FIX: "image bhejo to list me kuch dikhta hi nahi"
    //
    // Pehle sirf `lastMessage.text` dikhta tha. Image message me text
    // khali hota hai — is liye row bilkul khali reh jati thi.
    // Ab media ka type dekh kar saaf label dikhta hai.
    const lm = item.lastMessage;
    const mediaLabel =
      lm?.mediaType === 'image'    ? '📷 Photo'
      : lm?.mediaType === 'video'  ? '🎥 Video'
      : lm?.mediaType === 'audio'  ? '🎤 Voice message'
      : lm?.mediaType === 'document' ? '📎 Document'
      : '';
    const last = isDeleted
      ? t.deleted_message_text
      : (lm?.text && lm.text.trim())
        ? lm.text
        : mediaLabel;
    const time        = item.lastMessageAt ? timeAgo(item.lastMessageAt) : '';
    const hasUnread   = (item.unreadCount ?? 0) > 0;
    const isMine      = item.lastMessage?.sender &&
                        String(item.lastMessage.sender._id) === currentUserIdRef.current;
    const previewText = isMine && !isDeleted ? `${t.you_prefix}${last}` : last;

    return (
      <TouchableOpacity
        style={[styles.row, {flexDirection: rowDir}]}
        onPress={() => openChat(item)}
        onLongPress={() => setDeletingChat(item)}
        delayLongPress={300}
        activeOpacity={0.72}>
        <UserAvatar uri={avatarUri} style={[styles.avatarImg, isRTL ? {marginLeft: 14} : {marginRight: 14}]} />
        <View style={styles.rowContent}>
          <View style={[styles.rowTop, {flexDirection: rowDir}]}>
            <Text style={[styles.name, hasUnread && styles.nameUnread, {textAlign: isRTL ? 'right' : 'left'}, isRTL ? {marginLeft: 8} : {marginRight: 8}]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>{time}</Text>
          </View>
          <View style={[styles.rowBottom, {flexDirection: rowDir}]}>
            <Text style={[styles.preview, hasUnread && styles.previewUnread, isDeleted && styles.previewDeleted, {textAlign: isRTL ? 'right' : 'left'}, isRTL ? {marginLeft: 8} : {marginRight: 8}]} numberOfLines={1}>
              {previewText}
            </Text>
            {item.isMuted && !hasUnread && <Text style={styles.mutedIcon}>🔇</Text>}
            {hasUnread && (
              <View style={[styles.badge, item.isMuted && styles.badgeMuted]}>
                <Text style={styles.badgeText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [openChat, rowDir, isRTL, t]);

  const keyExtractor = useCallback((item: Conversation) => item._id, []);

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.btnRed} /></View>;
  }

  return (
    <View style={styles.container}>
      <ConversationHeader
        profileName={myname} profileId={currentUserId} profileAvatar={myAvatar}
        onProfilePress={() => navigation.navigate('Profile')}
        onSearch={(text: string) => setSearchQuery(text)}
      />
      <FollowRequestsButton navigation={navigation} />
      <FlatList
        data={filtered} keyExtractor={keyExtractor} renderItem={renderItem}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 8, paddingBottom: 100}}
        ListHeaderComponent={loadError ? <TouchableOpacity onPress={() => fetchChats(false, true)} style={{padding: 16}}><Text style={{color: '#FF827C', textAlign: 'center'}}>{isRTL ? 'تعذر تحديث المحادثات · إعادة المحاولة' : 'Could not refresh conversations · Tap to retry'}</Text></TouchableOpacity> : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        windowSize={11} maxToRenderPerBatch={10}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); lastLoadedRef.current = 0; fetchChats(false, true); }}
            colors={[Colors.White]} tintColor={Colors.White}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Text style={styles.emptyEmoji}>💬</Text></View>
            <Text style={styles.emptyTitle}>{t.no_conversations}</Text>
            <Text style={[styles.emptySub, {textAlign: 'center'}]}>{t.start_chatting}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('StartChatScreen')}>
              <Text style={styles.emptyBtnText}>{t.find_friends}</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, {bottom: 120}, isRTL ? {left: 20} : {right: 20}]}
        onPress={() => navigation.navigate('StartChatScreen')} activeOpacity={0.85}>
        <Image source={chatMessage} style={styles.fabIcon} />
        <Text style={styles.fabText}>{t.new_chat}</Text>
      </TouchableOpacity>
      <DeleteConversation
        visible={!!deletingChat}
        participantName={deletingChat?.participant?.name || 'User'}
        onClose={() => setDeletingChat(null)}
        onDelete={() => { if (deletingChat) deleteConversation(deletingChat._id); setDeletingChat(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   {flex: 1, backgroundColor: Colors.dargBg},
  loader:      {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#191B20'},

  row:         {alignItems: 'center', paddingHorizontal: 18, paddingVertical: 13, backgroundColor: 'transparent', marginHorizontal: 0, borderRadius: 0},
  separator:   {height: 1, backgroundColor: '#23262D', marginLeft: 82, marginRight: 20},
  avatarImg:   {width: 50, height: 50, borderRadius: 25, flexShrink: 0},
  avatarWrap:  {width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', flexShrink: 0},
  avatarText:  {color: Colors.White, fontWeight: '800', fontSize: 19},
  rowContent:  {flex: 1},
  rowTop:      {alignItems: 'center', marginBottom: 3, justifyContent: 'space-between'},
  name:        {fontSize: 15, fontWeight: '600', color: Colors.White, flex: 1},
  nameUnread:  {fontWeight: '800', color: Colors.White},
  time:        {fontSize: 11, color: Colors.White, fontWeight: '500', flexShrink: 0},
  timeUnread:  {color: Colors.btnRed, fontWeight: '700'},
  rowBottom:   {alignItems: 'center', justifyContent: 'space-between'},
  preview:     {flex: 1, fontSize: 13, color: '#ABB2BF', fontWeight: '400'},
  previewUnread:  {color: Colors.White, fontWeight: '600'},
  previewDeleted: {fontStyle: 'italic', color: Colors.Grey9},
  mutedIcon:   {fontSize: 13, marginRight: 4},
  badge:       {backgroundColor: Colors.btnRed, borderRadius: 12, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, flexShrink: 0},
  badgeMuted:  {backgroundColor: Colors.Grey9},
  badgeText:   {color: Colors.White, fontSize: 11, fontWeight: '700'},
  emptyState:  {alignItems: 'center', marginTop: 160, paddingHorizontal: 40, gap: 10},
  emptyIcon:   {width: 80, height: 80, borderRadius: 40, backgroundColor: '#191B20', justifyContent: 'center', alignItems: 'center', marginBottom: 8},
  emptyEmoji:  {fontSize: 36},
  emptyTitle:  {fontSize: 18, fontWeight: '700', color: Colors.White},
  emptySub:    {fontSize: 13, color: Colors.Grey9, lineHeight: 18},
  emptyBtn:    {marginTop: 8, backgroundColor: Colors.btnRed, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12},
  emptyBtnText:{color: Colors.White, fontWeight: '700', fontSize: 14},
  fab:         {flexDirection: 'row', position: 'absolute', backgroundColor: Colors.btnRed, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 32, alignItems: 'center', justifyContent: 'center', gap: 8},
  fabIcon:     {width: 20, height: 20, tintColor: Colors.White},
  fabText:     {color: Colors.White, fontSize: 15, fontWeight: '700'},
});

