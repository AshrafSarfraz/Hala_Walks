import {clearDeletedChatHistory} from './chatScreen';
import {useSocialRefresh} from './useSocialRefresh';
import UserAvatar from '../Component/UserAvatar';
import {Text} from '../../ui/Text';
import {CollectionPage, fetchCollectionPage, mergeById} from '../api/page';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
// src/halabsaudi/chat/conversationScreen.tsx
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
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
import {useStatusBar} from '../Component/UseStatusBar/useStatusBar';
// ✅ backend ab { chats, hasMore } deta hai — array nahi
// ✅ app icon ka badge
import {
  setBadgeFromChats,
  clearChatNotifications,
} from '../Notifications/badge';

import {hbsText} from '../i18n/translations';

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
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

const CACHE_KEY = 'hala_conversations';
const CACHE_DURATION = 5 * 60 * 1000;

let _cacheOwner: string | null = null;
let _writeTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(data: Conversation[]) {
  const ownerId = _cacheOwner;
  if (!ownerId) return;
  if (_writeTimer) clearTimeout(_writeTimer);
  _writeTimer = setTimeout(() => {
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ownerId, data})).catch(
      () => {},
    );
  }, 600);
}

export function clearConversationCache() {
  if (_writeTimer) clearTimeout(_writeTimer);
  _writeTimer = null;
  _cacheOwner = null;
}

export default function ConversationsScreen({navigation}: any) {
  useStatusBar('dark-content', Colors.surface, true);
  const language = useSelector((state: RootState) => state.language.language);
  const t = languageData[language];
  const isRTL = language === 'ar';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchCatalog, setSearchCatalog] = useState<Conversation[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pagination = useRef({
    page: 0,
    cursor: null as string | null,
    hasMore: false,
  });
  const requestController = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const completeBadgeChats = useRef<Conversation[] | null>(null);
  const badgeChanges = useRef(new Map<string, number>());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [myname, setMyname] = useState('');
  const [deletingChat, setDeletingChat] = useState<Conversation | null>(null);

  const currentUserIdRef = useRef('');
  const tokenRef = useRef('');
  const lastLoadedRef = useRef<number>(0);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);
  useEffect(
    () => () => {
      requestController.current?.abort();
      clearConversationCache();
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.getItem('hala_user_backend')
        .then(raw => {
          if (active && raw) {
            const user = JSON.parse(raw);
            setMyAvatar(user.avatar || null);
            setMyname(user.name || '');
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  const fetchVersion = useRef(0);
  const syncCompleteBadge = useCallback(
    async (
      rows: Conversation[],
      meta: {page: number; cursor: string | null; hasMore: boolean},
      token: string,
      signal: AbortSignal,
      version: number,
    ) => {
      // OS badge requires ALL conversations. Finish that sync in the background,
      // while the list renders one page at a time; never undercount a partial list.
      let all = [...rows];
      let cursor = meta.cursor;
      let page = meta.page;
      let more = meta.hasMore;
      try {
        while (more && page < 100 && !signal.aborted) {
          const next = await fetchCollectionPage<Conversation>(
            `${BASE_URL}/api/chat`,
            {
              headers: {Authorization: `Bearer ${token}`},
              signal,
            },
            ['chats'],
            ++page,
            cursor,
          );
          all.push(...next.items);
          cursor = next.nextCursor;
          more = next.hasMore;
        }
        if (more || signal.aborted || version !== fetchVersion.current) return;
        completeBadgeChats.current = mergeById(all).map(chat =>
          badgeChanges.current.has(chat._id)
            ? {...chat, unreadCount: badgeChanges.current.get(chat._id)!}
            : chat,
        );
        setSearchCatalog(sortByRecent(completeBadgeChats.current));
        await setBadgeFromChats(completeBadgeChats.current);
      } catch {
        /* A failed badge sync must not hide already loaded chats. */
      }
    },
    [],
  );
  const fetchChats = useCallback(
    async (showLoader: boolean, force = false, signal?: AbortSignal) => {
      const tok = tokenRef.current;
      if (!tok || signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (busy.current) {
        setRefreshing(false);
        return;
      }
      if (
        !force &&
        !showLoader &&
        Date.now() - lastLoadedRef.current < CACHE_DURATION
      ) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      busy.current = true;
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      const abort = () => controller.abort();
      signal?.addEventListener('abort', abort);
      const version = ++fetchVersion.current;
      badgeChanges.current.clear();
      if (showLoader) setLoading(true);
      try {
        let rows: Conversation[] = [];
        let cursor: string | null = null;
        const count = Math.max(1, pagination.current.page);
        let meta: {page: number; cursor: string | null; hasMore: boolean} = {
          page: 0,
          cursor,
          hasMore: false,
        };
        for (let page = 1; page <= count; page++) {
          const result: CollectionPage<Conversation> =
            await fetchCollectionPage<Conversation>(
              `${BASE_URL}/api/chat`,
              {
                headers: {Authorization: `Bearer ${tok}`},
                signal: controller.signal,
              },
              ['chats'],
              page,
              cursor,
            );
          rows.push(...result.items);
          meta = {page, cursor: result.nextCursor, hasMore: result.hasMore};
          cursor = result.nextCursor;
          if (!result.hasMore) break;
        }
        if (controller.signal.aborted || version !== fetchVersion.current)
          return;
        const sorted = sortByRecent(
          mergeById(rows).map(chat => ({
            ...chat,
            unreadCount: chat.unreadCount ?? 0,
          })),
        );
        pagination.current = meta;
        setHasMore(meta.hasMore);
        lastLoadedRef.current = Date.now();
        setConversations(sorted);
        setLoadError(false);
        setMoreError(false);
        debouncedSave(sorted);
        // Badge sync has its own lifetime until the next refresh or screen unmount.
        signal?.removeEventListener('abort', abort);
        void syncCompleteBadge(sorted, meta, tok, controller.signal, version);
      } catch {
        if (!controller.signal.aborted && version === fetchVersion.current)
          setLoadError(true);
      } finally {
        signal?.removeEventListener('abort', abort);
        if (version === fetchVersion.current) {
          busy.current = false;
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [syncCompleteBadge],
  );
  // Init
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [tok, cachedRaw] = await Promise.all([
          AsyncStorage.getItem('hala_token'),
          AsyncStorage.getItem(CACHE_KEY),
        ]);

        if (!active) return;
        if (!tok) {
          setLoading(false);
          return;
        }
        tokenRef.current = tok;
        let restored = false;
        try {
          const decoded: any = jwtDecode(tok);
          const myId = String(decoded._id || decoded.id || '');
          setCurrentUserId(myId);
          currentUserIdRef.current = myId;
          _cacheOwner = myId;
          setMyname(decoded.name || '');
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (myId && cached.ownerId === myId && Array.isArray(cached.data)) {
              setConversations(cached.data);
              setLoading(false);
              restored = true;
            }
          }
        } catch {}
        await fetchChats(!restored);
      } catch (err) {
        console.log('[ConvScreen] init error:', err);
        setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchChats]);

  const loadMore = useCallback(async () => {
    if (busy.current || !pagination.current.hasMore || !tokenRef.current)
      return;
    busy.current = true;
    setLoadingMore(true);
    setMoreError(false);
    const version = fetchVersion.current;
    const controller = requestController.current;
    try {
      const next = await fetchCollectionPage<Conversation>(
        `${BASE_URL}/api/chat`,
        {
          headers: {Authorization: `Bearer ${tokenRef.current}`},
          signal: controller?.signal,
        },
        ['chats'],
        pagination.current.page + 1,
        pagination.current.cursor,
      );
      if (version !== fetchVersion.current || controller?.signal.aborted)
        return;
      pagination.current = {
        page: next.page,
        cursor: next.nextCursor,
        hasMore: next.hasMore,
      };
      setHasMore(next.hasMore);
      setConversations(old => sortByRecent(mergeById([...old, ...next.items])));
    } catch {
      if (!controller?.signal.aborted) setMoreError(true);
    } finally {
      busy.current = false;
      if (!controller?.signal.aborted) setLoadingMore(false);
    }
  }, []);
  const refreshFriends = useCallback(
    async (signal: AbortSignal) => {
      if (tokenRef.current) await fetchChats(false, true, signal);
    },
    [fetchChats],
  );
  const keepChats = useCallback(() => {}, []);
  useSocialRefresh(refreshFriends, keepChats);

  // Socket
  const handleChatUpdatedRef = useRef<(data: any) => void>(() => {});
  handleChatUpdatedRef.current = (data: any) => {
    const known = completeBadgeChats.current?.find(
      chat => chat._id === data.chatId,
    );
    const unread =
      data.unreadCount ??
      (data.incrementUnread
        ? (badgeChanges.current.get(data.chatId) ?? known?.unreadCount ?? 0) + 1
        : undefined);
    if (typeof unread === 'number')
      badgeChanges.current.set(data.chatId, unread);
    if (completeBadgeChats.current) {
      completeBadgeChats.current = completeBadgeChats.current.map(chat =>
        chat._id === data.chatId
          ? {
              ...chat,
              unreadCount:
                data.unreadCount ??
                (data.incrementUnread
                  ? (chat.unreadCount || 0) + 1
                  : chat.unreadCount),
            }
          : chat,
      );
      setSearchCatalog(sortByRecent(completeBadgeChats.current));
      void setBadgeFromChats(completeBadgeChats.current);
    }
    setConversations(prev => {
      const chatExists = prev.some(c => c._id === data.chatId);
      if (!chatExists) {
        fetchChats(false, true);
        return prev;
      }
      const updated = prev.map(chat => {
        if (chat._id !== data.chatId) return chat;
        const newUnread =
          data.unreadCount !== undefined
            ? data.unreadCount
            : data.incrementUnread
            ? (chat.unreadCount || 0) + 1
            : chat.unreadCount;
        return {
          ...chat,
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt,
          unreadCount: newUnread,
        };
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
      if (!socket) {
        retryTimer = setTimeout(register, 500);
        return;
      }
      socket.off('chat-updated', stableHandler);
      socket.on('chat-updated', stableHandler);
    };
    register();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      getSocket()?.off('chat-updated', stableHandler);
    };
  }, []);

  const filtered = useMemo(
    () =>
      (searchQuery.trim() && searchCatalog
        ? searchCatalog
        : conversations
      ).filter(c =>
        !searchQuery.trim()
          ? true
          : c.participant?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            c.lastMessage?.text
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery, searchCatalog],
  );

  const openChat = useCallback(
    (chat: Conversation) => {
      badgeChanges.current.set(chat._id, 0);
      // ✅ chat kholte hi us chat ki notifications tray se hatao
      clearChatNotifications(chat._id);

      setConversations(prev => {
        const updated = prev.map(c =>
          c._id === chat._id ? {...c, unreadCount: 0} : c,
        );
        if (completeBadgeChats.current) {
          completeBadgeChats.current = completeBadgeChats.current.map(c =>
            c._id === chat._id ? {...c, unreadCount: 0} : c,
          );
          void setBadgeFromChats(completeBadgeChats.current);
        }
        return updated;
      });
      navigation.navigate('ChatScreen', {
        chatId: chat._id,
        participantName: chat.participant?.name || 'User',
        participantId: chat.participant?._id || '',
        participantAvatar: chat.participant?.avatar || null,
        participantHidesOnline: chat.participantHidesOnline || false,
        participantHidesLastSeen: chat.participantLastSeen === null,
      });
    },
    [navigation],
  );

  const deleteConversation = useCallback(
    async (chatId: string) => {
      // Ignore list/badge requests started before this deletion.
      requestController.current?.abort();
      fetchVersion.current += 1;
      busy.current = false;
      setLoadingMore(false);
      badgeChanges.current.set(chatId, 0);
      if (completeBadgeChats.current) {
        completeBadgeChats.current = completeBadgeChats.current.filter(
          chat => chat._id !== chatId,
        );
        void setBadgeFromChats(completeBadgeChats.current);
      }
      clearChatNotifications(chatId);
      setSearchCatalog(old => old?.filter(chat => chat._id !== chatId) ?? null);
      setConversations(prev => {
        const updated = prev.filter(c => c._id !== chatId);
        debouncedSave(updated);
        return updated;
      });
      try {
        await axios.delete(`${BASE_URL}/api/chat/${chatId}`, {
          headers: {Authorization: `Bearer ${tokenRef.current}`},
          timeout: 10000,
        });
        await clearDeletedChatHistory(chatId);
      } catch {
        fetchChats(false, true);
      }
    },
    [fetchChats],
  );

  const renderItem = useCallback(
    ({item}: {item: Conversation}) => {
      const name = item.participant?.name || 'User';
      const avatarUri = item.participant?.avatar || null;
      const isDeleted = item.lastMessage?.deleted;
      // ✅ FIX: "image bhejo to list me kuch dikhta hi nahi"
      //
      // Pehle sirf `lastMessage.text` dikhta tha. Image message me text
      // khali hota hai — is liye row bilkul khali reh jati thi.
      // Ab media ka type dekh kar saaf label dikhta hai.
      const lm = item.lastMessage;
      const mediaLabel =
        lm?.mediaType === 'image'
          ? 'Photo'
          : lm?.mediaType === 'video'
          ? 'Video'
          : lm?.mediaType === 'audio'
          ? 'Voice message'
          : lm?.mediaType === 'document'
          ? '📎 Document'
          : '';
      const last = isDeleted
        ? t.deleted_message_text
        : lm?.text && lm.text.trim()
        ? lm.text
        : mediaLabel || hbsText(isRTL, 'ui_you_are_now_connected_say_hello');
      const time = item.lastMessageAt ? timeAgo(item.lastMessageAt) : '';
      const hasUnread = (item.unreadCount ?? 0) > 0;
      const isMine =
        item.lastMessage?.sender &&
        String(item.lastMessage.sender._id) === currentUserIdRef.current;
      const previewText =
        isMine && !isDeleted ? `${t.you_prefix}${last}` : last;

      return (
        <TouchableOpacity
          style={[styles.row, {flexDirection: rowDir}]}
          onPress={() => openChat(item)}
          onLongPress={() => setDeletingChat(item)}
          delayLongPress={300}
          activeOpacity={0.72}>
          <UserAvatar
            uri={avatarUri}
            style={[
              styles.avatarImg,
              isRTL ? {marginLeft: 14} : {marginRight: 14},
            ]}
          />
          <View style={styles.rowContent}>
            <View style={[styles.rowTop, {flexDirection: rowDir}]}>
              <Text
                style={[
                  styles.name,
                  hasUnread && styles.nameUnread,
                  {textAlign: isRTL ? 'right' : 'left'},
                  isRTL ? {marginLeft: 8} : {marginRight: 8},
                ]}
                numberOfLines={1}>
                {name}
              </Text>
              <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                {time}
              </Text>
            </View>
            <View style={[styles.rowBottom, {flexDirection: rowDir}]}>
              <Text
                style={[
                  styles.preview,
                  hasUnread && styles.previewUnread,
                  isDeleted && styles.previewDeleted,
                  {textAlign: isRTL ? 'right' : 'left'},
                  isRTL ? {marginLeft: 8} : {marginRight: 8},
                ]}
                numberOfLines={1}>
                {previewText}
              </Text>
              {item.isMuted && !hasUnread && (
                <Text style={styles.mutedIcon}>🔇</Text>
              )}
              {hasUnread && (
                <View style={[styles.badge, item.isMuted && styles.badgeMuted]}>
                  <Text style={styles.badgeText}>
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [openChat, rowDir, isRTL, t],
  );

  const keyExtractor = useCallback((item: Conversation) => item._id, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ConversationHeader
        profileName={myname}
        profileId={currentUserId}
        profileAvatar={myAvatar}
        onProfilePress={() => navigation.navigate('Profile')}
        onSearch={(text: string) => setSearchQuery(text)}
      />
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={() => {
          if (!moreError) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        initialNumToRender={15}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={Colors.accent} />
          ) : hasMore ? (
            <TouchableOpacity onPress={loadMore} style={{padding: 18}}>
              <Text style={{color: Colors.accent, textAlign: 'center'}}>
                {isRTL
                  ? 'تحميل المزيد'
                  : moreError
                  ? 'Could not load more · Retry'
                  : 'Load more'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 8, paddingBottom: 100}}
        ListHeaderComponent={
          loadError ? (
            <TouchableOpacity
              onPress={() => fetchChats(false, true)}
              style={{padding: 16}}>
              <Text style={{color: Colors.accent, textAlign: 'center'}}>
                {hbsText(
                  isRTL,
                  'ui_could_not_refresh_conversations_tap_to_retry',
                )}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        windowSize={11}
        maxToRenderPerBatch={10}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              lastLoadedRef.current = 0;
              fetchChats(false, true);
            }}
            colors={[Colors.textPrimary]}
            tintColor={Colors.textPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={34}
                color={Colors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>{t.no_conversations}</Text>
            <Text style={[styles.emptySub, {textAlign: 'center'}]}>
              {t.start_chatting}
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('StartChatScreen')}>
              <Text style={styles.emptyBtnText}>{t.find_friends}</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, {bottom: 120}, isRTL ? {left: 20} : {right: 20}]}
        onPress={() => navigation.navigate('StartChatScreen')}
        activeOpacity={0.85}>
        <Image source={chatMessage} style={styles.fabIcon} />
        <Text style={styles.fabText}>{t.new_chat}</Text>
      </TouchableOpacity>
      <DeleteConversation
        visible={!!deletingChat}
        participantName={deletingChat?.participant?.name || 'User'}
        onClose={() => setDeletingChat(null)}
        onDelete={() => {
          if (deletingChat) deleteConversation(deletingChat._id);
          setDeletingChat(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },

  row: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: Colors.transparent,
    marginHorizontal: 0,
    borderRadius: 0,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.surfaceRaised,
    marginLeft: 82,
    marginRight: 20,
  },
  avatarImg: {width: 50, height: 50, borderRadius: 25, flexShrink: 0},
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {color: Colors.white, fontWeight: '800', fontSize: 19},
  rowContent: {flex: 1},
  rowTop: {
    alignItems: 'center',
    marginBottom: 3,
    justifyContent: 'space-between',
  },
  name: {fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1},
  nameUnread: {fontWeight: '800', color: Colors.textPrimary},
  time: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '500',
    flexShrink: 0,
  },
  timeUnread: {color: Colors.accent, fontWeight: '700'},
  rowBottom: {alignItems: 'center', justifyContent: 'space-between'},
  preview: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  previewUnread: {color: Colors.textPrimary, fontWeight: '600'},
  previewDeleted: {fontStyle: 'italic', color: Colors.textMuted},
  mutedIcon: {fontSize: 13, marginRight: 4},
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  badgeMuted: {backgroundColor: Colors.textMuted},
  badgeText: {color: Colors.white, fontSize: 11, fontWeight: '700'},
  emptyState: {
    alignItems: 'center',
    marginTop: 160,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {fontSize: 18, fontWeight: '700', color: Colors.textPrimary},
  emptySub: {fontSize: 13, color: Colors.textMuted, lineHeight: 18},
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  emptyBtnText: {color: Colors.white, fontWeight: '700', fontSize: 14},
  fab: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: Colors.accent,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabIcon: {width: 20, height: 20, tintColor: Colors.white},
  fabText: {color: Colors.white, fontSize: 15, fontWeight: '700'},
});
