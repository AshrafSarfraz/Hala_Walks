import {useSocialRefresh} from './useSocialRefresh';
import {Text} from '../../ui/Text';
import Clipboard from '@react-native-clipboard/clipboard';
import {mergeMessages, messagePage, dateLabel} from './messageModel';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {Alert} from '../../ui/Alert';
import {TextInput} from '../../ui/TextInput';
// src/halabsaudi/chat/chatScreen.tsx
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {View, Platform, StyleSheet, TouchableOpacity, FlatList, Image, Animated, PanResponder, Keyboard} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Ionicons from '@react-native-vector-icons/ionicons';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useSelector} from 'react-redux';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {getSocket, connectSocket} from './socket';
import {
  getMediaOutbox,
  subscribeMediaOutbox,
  uploadMediaJob,
  patchMediaJob,
  removeMediaJob,
  retryMediaJob,
  MediaOutboxJob,
} from './mediaOutbox';
import AttachmentSheet from './components/AttachmentSheet';
import ChatScreenHeader from './components/ChatHeaders/ChatScreenHeader';
import DeleteMessageModal from './components/DeleteMessageModal';
import ImageViewerModal from './components/ImageViewerModal';
import WhatsAppMessageModal, {
  MessageAction,
} from './components/WhatsAppMessageModal';
import {languageData} from '../redux_toolkit/language/languageSlice';
import {RootState} from '../redux_toolkit/store';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';
// ✅ NEW — chat kholte hi us chat ki notifications tray se hatao
import {clearChatNotifications} from '../Notifications/badge';

import {hbsText} from '../i18n/translations';

// ─── Module-level stores ──────────────────────────────────────────────────────
const messageCache = new Map<string, Message[]>();
const offlineQueues = new Map<string, QueuedMessage[]>();

const CHAT_CACHE_PREFIX = 'hbs_chat_cache_v2_';

async function readPersistentChat(chatId: string): Promise<Message[]> {
  try {
    const raw = await AsyncStorage.getItem(`${CHAT_CACHE_PREFIX}${chatId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: any) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  } catch {
    return [];
  }
}

async function writePersistentChat(chatId: string, items: Message[]) {
  try {
    await AsyncStorage.setItem(
      `${CHAT_CACHE_PREFIX}${chatId}`,
      JSON.stringify(
        items.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt).toISOString(),
        })),
      ),
    );
  } catch (error) {
    console.log('[CHAT CACHE] save failed:', error);
  }
}
export function clearChatSession() {messageCache.clear(); offlineQueues.clear();}

function getQueue(chatId: string): QueuedMessage[] {
  if (!offlineQueues.has(chatId)) offlineQueues.set(chatId, []);
  return offlineQueues.get(chatId)!;
}
function pushToQueue(chatId: string, item: QueuedMessage) {
  getQueue(chatId).push(item);
}
function clearQueue(chatId: string) {
  offlineQueues.set(chatId, []);
}

type MsgStatus = 'pending' | 'sending' | 'sent' | 'failed';
type TickStatus = 'sent' | 'delivered' | 'seen';

type Message = {
  _id: string;
  text: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
  tempId?: string;
  status?: MsgStatus;
  msgStatus?: TickStatus;
  deleted?: boolean;
  edited?: boolean;
  replyTo?: {_id: string; text: string; sender?: {name: string}} | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaType?: 'image' | 'video' | 'document' | 'audio' | null;
  mediaName?: string | null;
  mediaSize?: number | null;
  mediaWidth?: number | null;
  mediaHeight?: number | null;
  localMediaUri?: string | null;
  uploadProgress?: number;
  uploadStage?: 'queued' | 'uploading' | 'uploaded' | 'sending' | 'failed';
  reactions?: Record<string, string>;
};

type QueuedMessage = {
  tempId: string;
  text: string;
  replyToId: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaType?: 'image' | 'video' | 'document' | 'audio' | null;
  mediaName?: string | null;
  mediaSize?: number | null;
  mediaWidth?: number | null;
  mediaHeight?: number | null;
};

function rankOf(s?: TickStatus): number {
  if (s === 'seen') return 3;
  if (s === 'delivered') return 2;
  return 1;
}
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatFullTime(date: Date): string {
  return new Date(date).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TickIcon({
  status,
  msgStatus,
  forImage = false,
}: {
  status?: MsgStatus;
  msgStatus?: TickStatus;
  forImage?: boolean;
}) {
  const size = forImage ? 13 : 14;
  const dim = forImage ? Colors.lightOverlay : Colors.textMuted;
  if (status === 'pending')
    return (
      <Ionicons
        name="time-outline"
        size={size}
        color={forImage ? Colors.lightOverlay : Colors.textMuted}
      />
    );
  if (status === 'sending')
    return (
      <ActivityIndicator
        size="small"
        color={forImage ? Colors.lightOverlay : Colors.textMuted}
        style={{width: size, height: size}}
      />
    );
  if (status === 'failed')
    return (
      <Ionicons
        name="alert-circle"
        size={size}
        color={forImage ? Colors.onMedia : Colors.accent}
      />
    );
  if (msgStatus === 'seen')
    return (
      <Ionicons
        name="checkmark-done"
        size={size}
        color={forImage ? Colors.textSecondary : Colors.info}
      />
    );
  if (msgStatus === 'delivered')
    return <Ionicons name="checkmark-done" size={size} color={dim} />;
  return <Ionicons name="checkmark" size={size} color={dim} />;
}

type SwipeableProps = {
  children: React.ReactNode;
  onSwipeReply: () => void;
  disabled?: boolean;
};
function SwipeableMessage({children, onSwipeReply, disabled}: SwipeableProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const replyIconOpacity = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !disabled && g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: () => {
        triggered.current = false;
      },
      onPanResponderMove: (_, g) => {
        if (disabled) return;
        const x = Math.min(g.dx, 80);
        if (x > 0) {
          translateX.setValue(x);
          replyIconOpacity.setValue(Math.min(x / 60, 1));
          if (x >= 60 && !triggered.current) {
            triggered.current = true;
            Animated.sequence([
              Animated.timing(translateX, {
                toValue: 68,
                duration: 60,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: 55,
                duration: 60,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      },
      onPanResponderRelease: (_, g) => {
        if (triggered.current && g.dx >= 50) onSwipeReply();
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
          }),
          Animated.timing(replyIconOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        triggered.current = false;
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        replyIconOpacity.setValue(0);
        triggered.current = false;
      },
    }),
  ).current;

  return (
    <View style={{position: 'relative'}}>
      <Animated.View
        style={[styles.swipeReplyIcon, {opacity: replyIconOpacity}]}>
        <Ionicons name="return-down-back-outline" size={20} color={Colors.textSecondary} />
      </Animated.View>
      <Animated.View
        style={{transform: [{translateX}]}}
        {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen(props: any) {
  return <ChatScreenContent key={String(props.route.params?.chatId || 'missing')} {...props} />;
}
function ChatScreenContent({route, navigation}: any) {
 useStatusBar('dark-content', Colors.surface, true);
  const language = useSelector((state: RootState) => state.language.language);
  const t = languageData[language];
  const isRTL = language === 'ar';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const {
    chatId,
    participantName = 'User',
    participantId = '',
    participantAvatar = null,
    participantHidesOnline = false,
    participantHidesLastSeen = false,
  } = route.params || {};
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>(
    messageCache.get(chatId) || [],
  );
  const [loading, setLoading] = useState(!messageCache.has(chatId));
  const [currentUserId, setCurrentUserId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});
  const [iBlockedThem, setIBlockedThem] = useState(false);
  const [theyBlockedMe, setTheyBlockedMe] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [loadErrorText, setLoadErrorText] = useState('');
  const [access, setAccessState] = useState<'checking' | 'allowed' | 'waiting' | 'error'>('checking');
  const canSendRef = useRef(false);
  const setAccess = (value: 'checking' | 'allowed' | 'waiting' | 'error') => {canSendRef.current = value === 'allowed'; setAccessState(value);};
  const [olderError, setOlderError] = useState(false);
  const [reload, setReload] = useState(0);
  const [awayFromLatest, setAwayFromLatest] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const awayRef = useRef(false);
  const listRef = useRef<FlatList<Message>>(null);
  const loadingOlderRef = useRef(false);
  const historyReady = useRef(false);
  const jumpToLatest = useCallback(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
    awayRef.current = false; setAwayFromLatest(false); setNewCount(0);
  }, []);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [muteDuration, setMuteDuration] = useState<any>(null);
  const isMuted = muteDuration !== null;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [composerHeight, setComposerHeight] = useState(68);
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);

  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgModalTarget, setMsgModalTarget] = useState<Message | null>(null);
  const [msgModalY, setMsgModalY] = useState(0);
  const [msgModalIsMe, setMsgModalIsMe] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingMsg, setDeletingMsg] = useState<Message | null>(null);
  const [imageViewer, setImageViewer] = useState<{
    uri: string;
    senderName: string;
    timestamp: string;
  } | null>(null);

  const resetPermission = useCallback(() => {setAccess('checking');}, []);
  const refreshPermission = useCallback(async (signal: AbortSignal) => {
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const {data} = await axios.get(`${BASE_URL}/api/users/${participantId}/message-permission`, {
        headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal,
      });
      if (!signal.aborted) setAccess(data.allowed === true ? 'allowed' : 'waiting');
    } catch {if (!signal.aborted) setAccess('error');}
  }, [participantId]);
  useSocialRefresh(refreshPermission, resetPermission);

  const isBlocked = iBlockedThem || theyBlockedMe;
  const isBlockedRef = useRef(false);
  const currentUserIdRef = useRef('');
  const chatIdRef = useRef(chatId);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const tokenRef = useRef('');
  const flushFnRef = useRef<() => void>(() => {});

  useEffect(() => { isBlockedRef.current = isBlocked; }, [isBlocked]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);

  // ✅ FIX: "notification bar bar reh jati hai"
  //
  // Pehle is file me `notifee` ka zikr tak nahi tha. User chat khol kar
  // message padh leta tha, lekin notification tray me wahin padi rehti
  // thi aur badge par bhi ginti rehti thi.
  useEffect(() => {
    if (chatId) clearChatNotifications(String(chatId));
  }, [chatId]);
  useEffect(() => {
    if (messages.length > 0) {
      messageCache.set(chatId, messages);
      writePersistentChat(chatId, messages);
    }
  }, [messages, chatId]);

  const isUserOnline = useMemo(
    () => onlineUsers.some(id => String(id) === String(participantId)),
    [onlineUsers, participantId],
  );
  const lastSeenText = lastSeenMap[String(participantId)];

  const historyCursor = useRef<string | null>(null);

  // ─── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const init = async () => {
      setLoadError(false);
      setAccess('checking');
      try {
        const token = await AsyncStorage.getItem('hala_token');
        if (!token || !chatId) throw new Error('Missing session');
        tokenRef.current = token;
        connectSocket(token);
        const decoded: any = jwtDecode(token);
        const myId = String(decoded?.id || decoded?._id || '');
        setCurrentUserId(myId);
        currentUserIdRef.current = myId;
        const muteRaw = await AsyncStorage.getItem(`mute_${chatId}`);
        if (muteRaw) setMuteDuration(JSON.parse(muteRaw).duration);

        // Show locally cached chat immediately. Server response will merge into it.
        const persisted = await readPersistentChat(String(chatId));
        if (active && persisted.length) {
          setMessages(current => mergeMessages([...persisted, ...current]));
          setLoading(false);
        }
        if (!/^[a-f0-9]{24}$/i.test(String(chatId))) {
          const real = await axios.post(`${BASE_URL}/api/chat/with/${participantId}`, {}, {headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal: controller.signal});
          if (active) navigation.replace('ChatScreen', {...route.params, chatId: real.data._id, isPendingChat: false});
          return;
        }
        const permission = await axios.get(`${BASE_URL}/api/users/${participantId}/message-permission`, {
          headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal: controller.signal,
        }).catch(() => null);
        if (!active) return;
        setAccess(permission ? (permission.data?.allowed === true ? 'allowed' : 'waiting') : 'error');
        const [blockRes, msgRes] = await Promise.all([
          participantId ? axios.get(`${BASE_URL}/api/block/status/${participantId}`, {
            headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal: controller.signal,
          }).catch(() => null) : Promise.resolve(null),
          axios.get(`${BASE_URL}/api/messages/chat/${chatId}?page=1&limit=20`, {
            headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal: controller.signal,
          }),
        ]);
        if (!active) return;
        setIBlockedThem(blockRes?.data?.iBlockedThem || false);
        setTheyBlockedMe(blockRes?.data?.theyBlockedMe || false);
        const firstPage = messagePage(msgRes.data);
        const raw = firstPage.messages;
        historyReady.current = true;
        setHasMore(firstPage.hasMore);
        historyCursor.current = firstPage.nextCursor;
        setPage(1);
        const normalized: Message[] = raw.map((m: any) => ({
          _id: String(m._id),
          text: m.text || '',
          createdAt: new Date(m.createdAt),
          senderId: String(m.sender?._id || m.sender || m.senderId || ''),
          tempId: m.tempId,
          senderName: m.sender?.name || 'User',
          msgStatus: (m.status as TickStatus) || 'sent',
          status: 'sent' as MsgStatus,
          deleted: !!m.deleted,
          edited: !!m.edited,
          replyTo: m.replyTo || null,
          mediaUrl: m.mediaUrl || null,
          thumbnailUrl: m.thumbnailUrl || null,
          mediaType: m.mediaType || null,
          mediaName: m.mediaName || null,
          mediaSize: m.mediaSize ?? null,
          mediaWidth: m.mediaWidth ?? null,
          mediaHeight: m.mediaHeight ?? null,
          reactions: m.reactions
            ? Object.fromEntries(Object.entries(m.reactions))
            : {},
        }));
        const pendingFromQueue = getQueue(chatId)
          .map(q => {
            const ex = (messageCache.get(chatId) || []).find(
              m => m.tempId === q.tempId,
            );
            return ex || null;
          })
          .filter(Boolean) as Message[];
        const sorted = mergeMessages(normalized);
        const pendingNotInServer = pendingFromQueue.filter(
          p => !sorted.find(s => s.tempId === p.tempId),
        );
        setMessages(current => mergeMessages([...sorted, ...current, ...pendingNotInServer]));
        if (canSendRef.current) flushFnRef.current();
      } catch (err: any) {
        if (active) {
          if (err?.response?.status === 403) {setAccess('waiting'); setLoadError(false); setHasMore(false);}
          else {
            setLoadError(true); setAccess('error');
            setLoadErrorText(err?.response?.status === 401 ? (hbsText(isRTL, 'ui_session_expired_please_sign_in_again')) : err?.response?.status === 404 ? (hbsText(isRTL, 'ui_conversation_unavailable_go_back_and_reopen_it')) : (hbsText(isRTL, 'ui_could_not_connect_tap_to_retry')));
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {active = false; controller.abort();};
  }, [chatId, participantId, reload]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, event => {
      if (Platform.OS === 'ios') {
        setKeyboardHeight(event.endCoordinates?.height+35 || 0);
      } else {
        // AndroidManifest uses adjustResize, so don't double-shift.
        setKeyboardHeight(0);
      }
    });

    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const composerBottom =
    Platform.OS === 'ios'
      ? Math.max(0, keyboardHeight - insets.bottom)
      : 0;

  // ─── Offline queue flush ──────────────────────────────────────────────────
  const flushOfflineQueue = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected || !canSendRef.current) return;
    const cid = chatIdRef.current;
    const queue = [...getQueue(cid)];
    if (!queue.length) return;
    clearQueue(cid);
    queue.forEach(item => {
      setMessages(prev =>
        prev.map(m =>
          m.tempId === item.tempId ? {...m, status: 'sending'} : m,
        ),
      );
      socket.emit('send-message', {
        chatId: cid,
        text: item.text,
        tempId: item.tempId,
        replyTo: item.replyToId,
        mediaUrl: item.mediaUrl || null,
        thumbnailUrl: item.thumbnailUrl || null,
        mediaType: item.mediaType || null,
        mediaName: item.mediaName || null,
        mediaSize: item.mediaSize ?? null,
        mediaWidth: item.mediaWidth ?? null,
        mediaHeight: item.mediaHeight ?? null,
      });
      // A timeout is not proof of delivery. Show a retry state.
      const tid = item.tempId;
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m =>
            m.tempId === tid && m.status === 'sending'
              ? {...m, status: 'failed'}
              : m,
          ),
        );
      }, 8000);
    });
  }, []);
  useEffect(() => { flushFnRef.current = flushOfflineQueue; }, [flushOfflineQueue]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable)
        setTimeout(() => flushFnRef.current(), 1500);
    });
    return () => unsub();
  }, []);

  // ─── Load more ────────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!historyReady.current || !hasMore || loadingOlderRef.current || loading || loadError) return;
    loadingOlderRef.current = true;
    setOlderError(false);
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await axios.get(
        `${BASE_URL}/api/messages/chat/${chatId}?limit=20&${historyCursor.current ? `before=${encodeURIComponent(historyCursor.current)}` : `page=${nextPage}`}`,
        {headers: {Authorization: `Bearer ${tokenRef.current}`}, timeout: 15000},
      );
      const result = messagePage(res.data);
      const raw = result.messages;
      setHasMore(result.hasMore);
      historyCursor.current = result.nextCursor;
      if (!raw.length) return;
      const older: Message[] = raw.map((m: any) => ({
        _id: String(m._id),
        text: m.text || '',
        createdAt: new Date(m.createdAt),
        senderId: String(m.sender?._id || m.sender || m.senderId || ''),
          tempId: m.tempId,
        senderName: m.sender?.name || 'User',
        msgStatus: (m.status as TickStatus) || 'sent',
        status: 'sent' as MsgStatus,
        deleted: !!m.deleted,
        edited: !!m.edited,
        replyTo: m.replyTo || null,
        mediaUrl: m.mediaUrl || null,
        thumbnailUrl: m.thumbnailUrl || null,
        mediaType: m.mediaType || null,
        mediaName: m.mediaName || null,
        mediaSize: m.mediaSize ?? null,
        mediaWidth: m.mediaWidth ?? null,
        mediaHeight: m.mediaHeight ?? null,
        reactions: m.reactions
          ? Object.fromEntries(Object.entries(m.reactions))
          : {},
      }));
      setMessages(prev => mergeMessages([...prev, ...older]));
      setPage(nextPage);
    } catch (e) {
      setOlderError(true);
    } finally {
      loadingOlderRef.current = false;
      setLoadingMore(false);
    }
  }, [chatId, hasMore, loading, loadError, page]);

  // ─── Online status ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    if (socket.connected) socket.emit('request-online-sync');
    const fmt = (date: string) => {
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
      if (diff < 1) return 'just now';
      if (diff < 60) return `${diff} min ago`;
      const h = Math.floor(diff / 60);
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    };
    const onAll = (users: string[]) =>
      setOnlineUsers([...new Set(users.map(String))]);
    const onIn = ({userId}: any) =>
      setOnlineUsers(prev => [...new Set([...prev, String(userId)])]);
    const onOut = ({userId, lastSeen}: any) => {
      setOnlineUsers(prev => prev.filter(id => id !== String(userId)));
      if (lastSeen)
        setLastSeenMap(prev => ({...prev, [String(userId)]: fmt(lastSeen)}));
    };
    socket.on('online-users', onAll);
    socket.on('user-online', onIn);
    socket.on('user-offline', onOut);
    socket.on('connect', () => socket.emit('request-online-sync'));
    return () => {
      socket.off('online-users', onAll);
      socket.off('user-online', onIn);
      socket.off('user-offline', onOut);
    };
  }, []);

  // ─── Socket: chat events ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;
    socket.emit('join-chat', chatId);

    const onConnect = () => {
      socket.emit('join-chat', chatId);
      socket.emit('request-online-sync');
      flushFnRef.current();
    };
    const onReceive = (msg: any) => {
      const incomingChat = msg.chat?._id || msg.chat || msg.chatId;
      if (incomingChat && String(incomingChat) !== String(chatId)) return;
      if (awayRef.current && String(msg.sender?._id || msg.sender || '') !== currentUserIdRef.current) setNewCount(count => count + 1);
      setIsTyping(false);
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(msg._id))) return prev;
        const exists = prev.some(m => m.tempId === msg.tempId && msg.tempId);
        if (exists)
          return prev.map(m =>
            m.tempId === msg.tempId
              ? {
                  ...m,
                  _id: String(msg._id),
                  status: 'sent',
                  msgStatus: 'delivered',
                  mediaUrl: msg.mediaUrl || m.mediaUrl,
                  thumbnailUrl: msg.thumbnailUrl || m.thumbnailUrl,
                  uploadStage: undefined,
                  uploadProgress: 100,
                }
              : m,
          );
        return mergeMessages([
          {
            _id: String(msg._id),
            text: msg.text || '',
            createdAt: new Date(msg.createdAt),
            senderId: String(msg.sender?._id || msg.sender || msg.senderId || ''),
            senderName: msg.sender?.name || 'User',
            msgStatus: 'delivered',
            status: 'sent',
            deleted: !!msg.deleted,
            replyTo: msg.replyTo || null,
            mediaUrl: msg.mediaUrl || null,
            thumbnailUrl: msg.thumbnailUrl || null,
            mediaType: msg.mediaType || null,
            mediaName: msg.mediaName || null,
            mediaSize: msg.mediaSize ?? null,
            mediaWidth: msg.mediaWidth ?? null,
            mediaHeight: msg.mediaHeight ?? null,
            reactions: {},
            tempId: msg.tempId,
          } as Message,
          ...prev,
        ]);
      });
      socket.emit('mark-read', {chatId, messageId: String(msg._id)});
    };
    const onStatus = (data: any) => {
      setSending(false);

      if (data?.tempId && data.status === 'sent') {
        removeMediaJob(data.tempId).catch(() => {});
      }
      if (data.status === 'failed' && data.reason === 'message_not_allowed') {
        setAccess('waiting');
        Alert.alert('Message unavailable', 'You no longer have permission to message this account.');
      }
      if (data.status === 'failed' && data.reason === 'blocked') {
        Alert.alert('Message unavailable', 'You cannot message this account.');
      }
      setMessages(prev =>
        prev.map(m => {
          if (m.tempId !== data.tempId) return m;
          const q = getQueue(chatId);
          const idx = q.findIndex(i => i.tempId === data.tempId);
          if (idx !== -1) q.splice(idx, 1);
          return {
            ...m,
            _id: data.message?._id ? String(data.message._id) : m._id,
            createdAt: data.message?.createdAt ? new Date(data.message.createdAt) : m.createdAt,
            status: data.status,
            msgStatus: data.msgStatus || 'sent',
            mediaUrl: data.message?.mediaUrl || m.mediaUrl,
            thumbnailUrl: data.message?.thumbnailUrl || m.thumbnailUrl,
            mediaType: data.message?.mediaType || m.mediaType,
            mediaName: data.message?.mediaName || m.mediaName,
            uploadStage: data.status === 'sent' ? undefined : m.uploadStage,
            uploadProgress: data.status === 'sent' ? 100 : m.uploadProgress,
          };
        }),
      );
    };
    const onRead = (data: any) => {
      if (data.chatId && String(data.chatId) !== String(chatId)) return;
      const ids = (data.messageIds || []).map(String);
      const ns: TickStatus = data.msgStatus || 'seen';
      setMessages(prev =>
        prev.map(m => {
          if (!ids.includes(String(m._id))) return m;
          if (rankOf(ns) <= rankOf(m.msgStatus)) return m;
          return {...m, msgStatus: ns};
        }),
      );
    };
    const onChatRead = (data: any) => {
      if (String(data.chatId) !== String(chatId)) return;
      setMessages(prev => prev.map(m => m.senderId === currentUserIdRef.current && m.status === 'sent' ? {...m, msgStatus: 'seen'} : m));
    };
    const onTyping = (d: any) => {
      if (String(d.userId) === String(participantId) && !isBlockedRef.current)
        setIsTyping(true);
    };
    const onStopTyping = (d: any) => {
      if (String(d.userId) === String(participantId)) setIsTyping(false);
    };
    const onDeleted = (d: any) =>
      setMessages(prev =>
        prev.map(m =>
          String(m._id) === String(d.messageId)
            ? {...m, text: t.deleted_message_text, deleted: true, mediaUrl: null}
            : m,
        ),
      );
    const onHidden = (d: any) =>
      setMessages(prev =>
        prev.filter(m => String(m._id) !== String(d.messageId)),
      );
    const onEdited = (d: any) =>
      setMessages(prev =>
        prev.map(m =>
          String(m._id) === String(d.messageId)
            ? {...m, text: d.newText, edited: true}
            : m,
        ),
      );
    const onReaction = (d: any) =>
      setMessages(prev =>
        prev.map(m => {
          if (String(m._id) !== String(d.messageId)) return m;
          const r = {...(m.reactions || {})};
          if (d.emoji) r[d.userId] = d.emoji;
          else delete r[d.userId];
          return {...m, reactions: r};
        }),
      );
    const onError = (d: any) => {
      setSending(false);
      if (d.tempId)
        setMessages(prev =>
          prev.map(m => (m.tempId === d.tempId ? {...m, status: 'failed'} : m)),
        );
    };

    socket.on('connect', onConnect);
    socket.on('receive-message', onReceive);
    socket.on('message-status', onStatus);
    socket.on('messages-read', onRead);
    socket.on('chat-read', onChatRead);
    socket.on('typing', onTyping);
    socket.on('stop-typing', onStopTyping);
    socket.on('message-deleted', onDeleted);
    socket.on('message-hidden', onHidden);
    socket.on('message-edited', onEdited);
    socket.on('message-reaction', onReaction);
    socket.on('message-error', onError);
    if (socket.connected) onConnect();

    return () => {
      socket.emit('leave-chat', chatId);
      socket.off('connect', onConnect);
      socket.off('receive-message', onReceive);
      socket.off('message-status', onStatus);
      socket.off('messages-read', onRead);
      socket.off('chat-read', onChatRead);
      socket.off('typing', onTyping);
      socket.off('stop-typing', onStopTyping);
      socket.off('message-deleted', onDeleted);
      socket.off('message-hidden', onHidden);
      socket.off('message-edited', onEdited);
      socket.off('message-reaction', onReaction);
      socket.off('message-error', onError);
    };
  }, [chatId, participantId, currentUserId, t.deleted_message_text]);

  // ─── onSend ───────────────────────────────────────────────────────────────
  const onSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isBlocked || sending || !canSendRef.current) return;
    
    jumpToLatest();

    if (editingMessage) {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('edit-message', {
          messageId: editingMessage._id,
          chatId,
          newText: text,
        });
        setMessages(prev =>
          prev.map(m =>
            m._id === editingMessage._id ? {...m, text, edited: true} : m,
          ),
        );
      }
      setEditingMessage(null);
      setInputText('');
      return;
    }

    const tempId =
      Date.now().toString() + Math.random().toString(36).slice(2, 8);
    const replyToId = replyTo?._id || null;
    const socket = getSocket();
    const canSend = socket?.connected === true;

    setMessages(prev => [
      {
        _id: tempId,
        text,
        createdAt: new Date(),
        senderId: currentUserIdRef.current,
        senderName: 'Me',
        tempId,
        status: canSend ? 'sending' : 'pending',
        msgStatus: 'sent',
        reactions: {},
        replyTo: replyTo
          ? {_id: replyTo._id, text: replyTo.text, sender: {name: replyTo.senderName}}
          : null,
      } as Message,
      ...prev,
    ]);
    setReplyTo(null);
    setInputText('');

    if (!canSend) {
      pushToQueue(chatId, {tempId, text, replyToId});
      return;
    }

    setSending(true);
    socket!.emit('send-message', {chatId, text, tempId, replyTo: replyToId});

    // Keep an unacknowledged message visibly retryable.
    setTimeout(() => {
      setSending(false);
      setMessages(prev =>
        prev.map(m =>
          m.tempId === tempId && m.status === 'sending'
            ? {...m, status: 'failed'}
            : m,
        ),
      );
    }, 5000);
  }, [chatId, inputText, isBlocked, editingMessage, replyTo, sending]);

  // ─── Persistent media outbox ──────────────────────────────────────────────
  // Preview screen only queues a local image and closes immediately.
  // This screen shows that local image at once, uploads it once, then sends
  // the already-uploaded URL through socket. If the app restarts, remote URL
  // is reused and the image is NOT uploaded again.
  const processingMediaRef = useRef<Set<string>>(new Set());

  const mediaJobToMessage = useCallback(
    (job: MediaOutboxJob): Message => ({
      _id: job.tempId,
      text: job.caption || '',
      createdAt: new Date(job.createdAt),
      senderId: currentUserIdRef.current,
      senderName: 'Me',
      tempId: job.tempId,
      status: job.stage === 'failed' ? 'failed' : 'sending',
      msgStatus: 'sent',
      mediaUrl: job.mediaUrl || job.localUri,
      localMediaUri: job.localUri,
      thumbnailUrl: job.thumbnailUrl || null,
      mediaType: job.mediaType,
      mediaName: job.mediaName || job.fileName,
      mediaSize: job.mediaSize ?? job.fileSize ?? null,
      mediaWidth: job.mediaWidth ?? job.width ?? null,
      mediaHeight: job.mediaHeight ?? job.height ?? null,
      uploadProgress: job.progress || 0,
      uploadStage: job.stage,
      reactions: {},
    }),
    [],
  );

  const mirrorOutboxIntoChat = useCallback(
    (jobs: MediaOutboxJob[]) => {
      const mine = jobs.filter(job => String(job.chatId) === String(chatId));
      if (!mine.length) return;

      setMessages(prev => {
        const next = [...prev];
        for (const job of mine) {
          const index = next.findIndex(m => m.tempId === job.tempId);
          if (index >= 0) {
            const current = next[index];
            next[index] = {
              ...current,
              text: job.caption,
              mediaUrl: job.mediaUrl || job.localUri,
              localMediaUri: job.localUri,
              thumbnailUrl: job.thumbnailUrl || current.thumbnailUrl || null,
              mediaType: job.mediaType,
              mediaName: job.mediaName || job.fileName,
              mediaSize: job.mediaSize ?? job.fileSize ?? null,
              mediaWidth: job.mediaWidth ?? job.width ?? null,
              mediaHeight: job.mediaHeight ?? job.height ?? null,
              uploadProgress: job.progress,
              uploadStage: job.stage,
              status: job.stage === 'failed' ? 'failed' : current.status === 'sent' ? 'sent' : 'sending',
            };
          } else {
            next.push(mediaJobToMessage(job));
          }
        }
        return mergeMessages(next);
      });

      setTimeout(() => jumpToLatest(), 50);
    },
    [chatId, jumpToLatest, mediaJobToMessage],
  );

  const waitForSocket = useCallback(async (token: string) => {
    let socket = getSocket() || connectSocket(token);
    if (socket.connected) return socket;

    socket.connect();

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.off('connect', onConnect);
        reject(new Error('Chat connection timed out'));
      }, 12000);

      const onConnect = () => {
        clearTimeout(timeout);
        socket.off('connect', onConnect);
        resolve();
      };

      socket.once('connect', onConnect);
    });

    return socket;
  }, []);

  const processMediaJob = useCallback(
    async (originalJob: MediaOutboxJob) => {
      if (
        String(originalJob.chatId) !== String(chatId) ||
        processingMediaRef.current.has(originalJob.tempId)
      ) {
        return;
      }

      processingMediaRef.current.add(originalJob.tempId);

      try {
        const token =
          tokenRef.current || (await AsyncStorage.getItem('hala_token'));
        if (!token) throw new Error('Missing session');

        // Re-read the job so we always use a previously uploaded URL when present.
        const allJobs = await getMediaOutbox();
        let job =
          allJobs.find(j => j.tempId === originalJob.tempId) || originalJob;

        if (!job.mediaUrl) {
          job = await uploadMediaJob(job, token);
        }

        // From here onwards upload is complete. Even after restart we only resend URL.
        await patchMediaJob(job.tempId, {
          stage: 'sending',
          progress: 100,
          error: null,
        });

        const socket = await waitForSocket(token);

        socket.emit('send-message', {
          chatId: job.chatId,
          text: job.caption,
          tempId: job.tempId,
          replyTo: null,
          mediaUrl: job.mediaUrl,
          thumbnailUrl: job.thumbnailUrl || null,
          mediaType: job.mediaType,
          mediaName: job.mediaName || job.fileName,
          mediaSize: job.mediaSize ?? null,
          mediaWidth: job.mediaWidth ?? null,
          mediaHeight: job.mediaHeight ?? null,
        });
      } catch (error: any) {
        console.log('[MEDIA OUTBOX] send failed:', error?.message || error);
        await patchMediaJob(originalJob.tempId, {
          stage: 'failed',
          error: error?.message || 'Could not send image',
        });
      } finally {
        processingMediaRef.current.delete(originalJob.tempId);
      }
    },
    [chatId, waitForSocket],
  );

  useEffect(() => {
    let mounted = true;

    const handleJobs = (jobs: MediaOutboxJob[]) => {
      if (!mounted) return;
      mirrorOutboxIntoChat(jobs);

      jobs
        .filter(
          job =>
            String(job.chatId) === String(chatId) &&
            ['queued', 'uploaded', 'sending'].includes(job.stage),
        )
        .forEach(job => {
          processMediaJob(job);
        });
    };

    getMediaOutbox().then(handleJobs);
    const unsubscribe = subscribeMediaOutbox(handleJobs);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [chatId, mirrorOutboxIntoChat, processMediaJob]);

  // Preview gets serializable params only. It queues locally and returns at once.
  const openImagePreview = useCallback(
    (asset: any) => {
      navigation.navigate('ImagePreview', {
        chatId: String(chatId),
        asset,
      });
    },
    [navigation, chatId],
  );

  const handleAttach = useCallback(() => {
    if (isBlocked || !canSendRef.current) return;
    
    Keyboard.dismiss();
    setAttachSheetOpen(true);
  }, [isBlocked]);

  const handleCamera = useCallback(() => {
    launchCamera({mediaType: 'photo', quality: 0.9}, r => {
      if (!r.didCancel && r.assets?.[0]) openImagePreview(r.assets[0]);
    });
  }, [openImagePreview]);

  const handleGallery = useCallback(() => {
    launchImageLibrary({mediaType: 'mixed', quality: 0.9}, r => {
      if (r.didCancel || !r.assets?.[0]) return;
      const asset = r.assets[0];

      if (asset.type?.startsWith('image')) {
        openImagePreview(asset);
        return;
      }

      // Non-image media can be added to the same outbox later.
      Alert.alert('Coming soon', 'Video/document sending will use the same outbox.');
    });
  }, [openImagePreview]);

  // ─── Reactions ────────────────────────────────────────────────────────────
  const handleReact = useCallback(
    (emoji: string | null) => {
      const socket = getSocket();
      if (!socket || !msgModalTarget) return;
      socket.emit('react-message', {
        messageId: msgModalTarget._id,
        chatId,
        emoji,
      });
      setMessages(prev =>
        prev.map(m => {
          if (m._id !== msgModalTarget._id) return m;
          const r = {...(m.reactions || {})};
          if (emoji) r[currentUserIdRef.current] = emoji;
          else delete r[currentUserIdRef.current];
          return {...m, reactions: r};
        }),
      );
    },
    [chatId, msgModalTarget],
  );

  const sendReactionDirect = useCallback(
    (msg: Message, emoji: string) => {
      const socket = getSocket();
      if (!socket) return;
      const myEmoji = msg.reactions?.[currentUserIdRef.current];
      const newEmoji = myEmoji === emoji ? null : emoji;
      socket.emit('react-message', {messageId: msg._id, chatId, emoji: newEmoji});
      setMessages(prev =>
        prev.map(m => {
          if (m._id !== msg._id) return m;
          const r = {...(m.reactions || {})};
          if (newEmoji) r[currentUserIdRef.current] = newEmoji;
          else delete r[currentUserIdRef.current];
          return {...m, reactions: r};
        }),
      );
    },
    [chatId],
  );

  // ─── Input ────────────────────────────────────────────────────────────────
  const onInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      
      const socket = getSocket();
      if (!socket) return;
      if (text.length > 0) {
        socket.emit('typing', {chatId});
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(
          () => socket.emit('stop-typing', {chatId}),
          2000,
        );
      } else {
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        socket.emit('stop-typing', {chatId});
      }
    },
    [chatId],
  );

  // ─── Long press modal ─────────────────────────────────────────────────────
  const onLongPress = useCallback((msg: Message, pageY: number) => {
    Keyboard.dismiss();
    
    setMsgModalTarget(msg);
    setMsgModalY(pageY);
    setMsgModalIsMe(String(msg.senderId) === currentUserIdRef.current);
    setMsgModalVisible(true);
  }, []);

  const msgModalActions = useMemo((): MessageAction[] => {
    if (!msgModalTarget) return [];
    const isMe = String(msgModalTarget.senderId) === currentUserIdRef.current;
    const items: MessageAction[] = [];
    if (!msgModalTarget.deleted)
      items.push({
        label: t.action_reply,
        icon: 'return-down-back-outline',
        onPress: () => {
          setReplyTo(msgModalTarget);
          setTimeout(() => inputRef.current?.focus(), 150);
        },
      });
    if (isMe && !msgModalTarget.deleted && !msgModalTarget.mediaUrl)
      items.push({
        label: t.action_edit,
        icon: 'create-outline',
        onPress: () => {
          setEditingMessage(msgModalTarget);
          setInputText(msgModalTarget.text);
          setTimeout(() => inputRef.current?.focus(), 150);
        },
      });
    if (msgModalTarget.text && !msgModalTarget.deleted)
      items.push({
        label: t.action_copy,
        icon: 'copy-outline',
        onPress: () => {
          try {
            Clipboard.setString(msgModalTarget.text);
          } catch {}
        },
      });
    if (!msgModalTarget.deleted)
      items.push({
        label: t.action_delete,
        icon: 'trash-outline',
        destructive: true,
        onPress: () => {
          setDeletingMsg(msgModalTarget);
          setDeleteModalVisible(true);
        },
      });
    return items;
  }, [msgModalTarget, t]);

  // ─── Render reactions ─────────────────────────────────────────────────────
  const renderReactions = (msg: Message) => {
    if (!msg.reactions || Object.keys(msg.reactions).length === 0) return null;
    const grouped = Object.values(msg.reactions).reduce((acc, emoji) => {
      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const myEmoji = msg.reactions[currentUserIdRef.current];
    const isMe = String(msg.senderId) === currentUserIdRef.current;
    return (
      <View
        style={[
          styles.reactionsRow,
          isMe ? styles.reactionsRight : styles.reactionsLeft,
        ]}>
        {Object.entries(grouped).map(([emoji, count]) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.reactionChip,
              myEmoji === emoji && styles.reactionChipMine,
            ]}
            onPress={() => sendReactionDirect(msg, emoji)}
            activeOpacity={0.7}>
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ─── Render message ───────────────────────────────────────────────────────
  const renderMessage = useCallback(
    ({item: msg}: {item: Message}) => {
      const isMe = String(msg.senderId) === currentUserIdRef.current;

      if (msg.deleted) {
        return (
          <View style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}>
            <View style={[styles.deletedBubble, {flexDirection: rowDir}]}>
              <Ionicons name="ban-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.deletedText}> {t.deleted_message_text}</Text>
            </View>
          </View>
        );
      }

      const hasMedia = !!msg.mediaUrl;
      const isImageOnly = msg.mediaType === 'image' && !msg.text;
      const isTextOnly = !!msg.text && !hasMedia;

      const Footer = (
        <View style={styles.msgFooter}>
          {msg.edited && (
            <Text style={[styles.editedLabel, {color: Colors.textMuted}]}>edited </Text>
          )}
          <Text style={[styles.msgTime, {color: Colors.textMuted}]}>
            {formatTime(msg.createdAt)}
          </Text>
          {isMe && (
            <View style={{marginLeft: 3}}>
              <TickIcon status={msg.status} msgStatus={msg.msgStatus} />
            </View>
          )}
        </View>
      );

      const bubbleContent = isImageOnly ? (
        <View style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() =>
              setImageViewer({
                uri: msg.mediaUrl!,
                senderName: isMe ? 'You' : msg.senderName,
                timestamp: formatFullTime(msg.createdAt),
              })
            }
            onLongPress={e => onLongPress(msg, e.nativeEvent.pageY)}
            delayLongPress={300}>
            <View
              style={[
                styles.imageBubble,
                isMe ? styles.imageBubbleRight : styles.imageBubbleLeft,
              ]}>
              <Image
                source={{uri: msg.localMediaUri || msg.mediaUrl!}}
                style={styles.mediaImageFull}
                resizeMode="cover"
              />

              {!!msg.uploadStage && msg.uploadStage !== 'failed' && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="small" color={Colors.onAccent} />
                  <Text style={styles.uploadOverlayText}>
                    {msg.uploadStage === 'uploading'
                      ? `${Math.max(1, msg.uploadProgress || 1)}%`
                      : msg.uploadStage === 'sending'
                        ? 'Sending…'
                        : 'Preparing…'}
                  </Text>
                </View>
              )}

              {msg.uploadStage === 'failed' && (
                <TouchableOpacity
                  style={styles.uploadOverlay}
                  onPress={() => {
                    if (msg.tempId) retryMediaJob(msg.tempId);
                  }}>
                  <Ionicons name="refresh" size={24} color={Colors.onMedia} />
                  <Text style={styles.uploadOverlayText}>Tap to retry</Text>
                </TouchableOpacity>
              )}
              <View style={styles.imageTimeOverlay}>
                <Text style={styles.imageTime}>{formatTime(msg.createdAt)}</Text>
                {isMe && (
                  <View style={{marginLeft: 3}}>
                    <TickIcon status={msg.status} msgStatus={msg.msgStatus} forImage />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
          {renderReactions(msg)}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={e => onLongPress(msg, e.nativeEvent.pageY)}
          delayLongPress={300}
          onPress={() => { Keyboard.dismiss();  }}
          style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}>
          {msg.replyTo && (
            <View
              style={[
                styles.replyPreview,
                isMe ? styles.replyRight : styles.replyLeft,
              ]}>
              <View style={styles.replyAccent} />
              <View style={{flex: 1, paddingHorizontal: 9, paddingVertical: 5}}>
                <Text style={styles.replyName}>
                  {msg.replyTo.sender?.name || 'User'}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {msg.replyTo.text}
                </Text>
              </View>
            </View>
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
            {msg.mediaUrl && msg.mediaType === 'image' && (
              <TouchableOpacity
                onPress={() =>
                  setImageViewer({
                    uri: msg.mediaUrl!,
                    senderName: isMe ? 'You' : msg.senderName,
                    timestamp: formatFullTime(msg.createdAt),
                  })
                }
                activeOpacity={0.9}>
                <Image
                  source={{uri: msg.localMediaUri || msg.mediaUrl!}}
                  style={styles.mediaImagePadded}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {msg.mediaUrl && msg.mediaType === 'video' && (
              <View style={styles.videoThumb}>
                <Ionicons name="play-circle" size={44} color={Colors.lightOverlay} />
              </View>
            )}
            {msg.mediaUrl && msg.mediaType === 'document' && (
              <View style={[styles.docRow, {flexDirection: rowDir}]}>
                <View
                  style={[
                    styles.docIconWrap,
                    {backgroundColor: isMe ? Colors.overlaySubtle : Colors.surface},
                  ]}>
                  <Ionicons
                    name="document-attach-outline"
                    size={18}
                    color={isMe ? Colors.border : Colors.brandGreen}
                  />
                </View>
                <Text
                  style={[
                    styles.docName,
                    {color: Colors.textPrimary, textAlign: isRTL ? 'right' : 'left'},
                  ]}
                  numberOfLines={2}>
                  {msg.mediaName || 'Document'}
                </Text>
              </View>
            )}
            {isTextOnly ? (
              <View style={styles.textWithTime}>
                <Text
                  style={[
                    styles.msgText,
                    styles.msgTextDark,
                    {textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr'},
                  ]}>
                  {msg.text}
                  <Text style={styles.timeSpacer}>
                    {'  '}{msg.edited ? '         ' : '      '}{isMe ? '     ' : ''}
                  </Text>
                </Text>
                <View style={styles.inlineTime}>{Footer}</View>
              </View>
            ) : (
              <>
                {!!msg.text && (
                  <Text
                    style={[
                      styles.msgText,
                      styles.msgTextDark,
                      {
                        marginTop: hasMedia ? 6 : 0,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                      },
                    ]}>
                    {msg.text}
                  </Text>
                )}
                <View style={styles.msgFooterRow}>{Footer}</View>
              </>
            )}
          </View>
          {renderReactions(msg)}
        </TouchableOpacity>
      );

      return (
        <SwipeableMessage
          onSwipeReply={() => {
            setReplyTo(msg);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          disabled={!!msg.deleted}>
          {bubbleContent}
        </SwipeableMessage>
      );
    },
    [onLongPress, sendReactionDirect, isRTL, rowDir, t.deleted_message_text],
  );

  const goToProfile = useCallback(() => {
    navigation.navigate('UserProfile', {
      participantId,
      participantName,
      chatId,
      isBlockedInitial: iBlockedThem,
      isMutedInitial: muteDuration,
    });
  }, [participantId, participantName, chatId, iBlockedThem, muteDuration, navigation]);

  if (loading)
    return (
      <SafeAreaView style={styles.loader}><TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} style={{padding: 20}}><Text style={{color: Colors.textPrimary}}>{hbsText(isRTL, 'ui_back')}</Text></TouchableOpacity><ActivityIndicator size="large" color={Colors.accent} /></SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={{backgroundColor: Colors.surface}}>
        <ChatScreenHeader
          name={participantName}
          userId={participantId}
          avatarUri={participantAvatar}
          isBlocked={iBlockedThem}
          isOnline={isUserOnline}
          lastSeen={lastSeenText || ''}
          isMuted={isMuted}
          onBackPress={() => navigation.goBack()}
          onProfilePress={goToProfile}
          hidesOnline={participantHidesOnline}
          hidesLastSeen={participantHidesLastSeen}
        />
        </View>
<View style={{ flex:1,backgroundColor: Colors.background}}>


          <View
            style={{
              flex: 1,
              paddingBottom: composerHeight + composerBottom,
            }}>
            <FlatList
              ref={listRef}
              data={messages}
              maintainVisibleContentPosition={{minIndexForVisible: 0, autoscrollToTopThreshold: 80}}
              onScroll={event => {
                const away = event.nativeEvent.contentOffset.y > 140;
                awayRef.current = away; setAwayFromLatest(away);
                if (!away) setNewCount(0);
              }}
              scrollEventThrottle={100}
              keyExtractor={item => item._id}
              renderItem={({item, index}) => {
                const older = messages[index + 1];
                const showDate = !older || new Date(item.createdAt).toDateString() !== new Date(older.createdAt).toDateString();
                return <View>{showDate && <View style={styles.datePill}><Text style={styles.historyText}>{dateLabel(item.createdAt, language)}</Text></View>}{renderMessage({item})}
                {item.status === 'failed' && !item.localMediaUri && <TouchableOpacity onPress={() => {
                  if (!canSendRef.current) {setReload(v => v + 1); return;}
                  const socket = getSocket();
                  if (!socket?.connected) {Alert.alert(hbsText(isRTL, 'ui_offline'), hbsText(isRTL, 'ui_reconnect_to_the_internet_and_try_again')); return;}
                  const tempId = item.tempId || item._id;
                  setMessages(prev => prev.map(m => m._id === item._id ? {...m, tempId, status: 'sending'} : m));
                  socket.emit('send-message', {
                    chatId,
                    text: item.text,
                    tempId,
                    replyTo: item.replyTo?._id || null,
                    mediaUrl: item.mediaUrl || null,
                    thumbnailUrl: item.thumbnailUrl || null,
                    mediaType: item.mediaType || null,
                    mediaName: item.mediaName || null,
                    mediaSize: item.mediaSize ?? null,
                    mediaWidth: item.mediaWidth ?? null,
                    mediaHeight: item.mediaHeight ?? null,
                  });
                  setTimeout(() => setMessages(prev => prev.map(m => m.tempId === tempId && m.status === 'sending' ? {...m, status: 'failed'} : m)), 10000);
                }}><Text style={styles.retryText}>{access === 'waiting' ? hbsText(isRTL, 'ui_waiting_for_friend_request_acceptance') : hbsText(isRTL, 'ui_send_not_confirmed_tap_to_retry')}</Text></TouchableOpacity>}
                </View>;
              }}
              inverted
              contentContainerStyle={{paddingHorizontal: 10, paddingVertical: 8}}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              windowSize={11}
              maxToRenderPerBatch={10}
              removeClippedSubviews={Platform.OS === 'android'}
              ListHeaderComponent={
                isTyping ? (
                  <View style={[styles.msgRow, styles.rowLeft]}>
                    <View
                      style={[
                        styles.bubble,
                        styles.bubbleLeft,
                        {paddingVertical: 12, paddingHorizontal: 16},
                      ]}>
                      <View style={styles.typingDots}>
                        <View style={[styles.dot, {opacity: 0.4}]} />
                        <View style={[styles.dot, {opacity: 0.7}]} />
                        <View style={styles.dot} />
                      </View>
                    </View>
                  </View>
                ) : null
              }
              ListEmptyComponent={!loadError ? <View style={styles.historyNotice}><Text style={styles.historyText}>{hbsText(isRTL, 'ui_no_messages_yet_say_hello')}</Text></View> : null}
              ListFooterComponent={<View style={styles.historyNotice}>
                {loadingMore ? <ActivityIndicator size="small" /> : <TouchableOpacity disabled={!hasMore && !loadError} onPress={() => loadError ? setReload(v => v + 1) : loadMore()}>
                  <Text style={styles.historyText}>{loadError ? loadErrorText : olderError ? (hbsText(isRTL, 'ui_could_not_load_earlier_messages_retry')) : hasMore ? (hbsText(isRTL, 'ui_load_earlier_messages')) : (hbsText(isRTL, 'ui_beginning_of_conversation'))}</Text>
                </TouchableOpacity>}
              </View>}
            />
            {awayFromLatest && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Jump to latest messages" onPress={jumpToLatest} style={styles.latestButton}><Ionicons name="chevron-down" size={20} color={Colors.textPrimary} /><Text style={{color: Colors.textPrimary, fontSize: 12}}>{newCount ? `${newCount} ${hbsText(isRTL, 'ui_new')}` : hbsText(isRTL, 'ui_latest')}</Text></TouchableOpacity>}
          </View>

          <View
            onLayout={event =>
              setComposerHeight(event.nativeEvent.layout.height)
            }
            style={[
              styles.composerDock,
              {bottom: composerBottom},
            ]}>
          {/* ── Reply / Edit bar ── */}
          {(replyTo || editingMessage) && (
            <View style={styles.replyBarOuter}>
              <View
                style={[
                  styles.replyBarInner,
                  {flexDirection: rowDir},
                  isRTL
                    ? {borderRightWidth: 3, borderRightColor: Colors.brandGreen, borderLeftWidth: 0}
                    : {borderLeftWidth: 3, borderLeftColor: Colors.brandGreen},
                ]}>
                <Ionicons
                  name={editingMessage ? 'create-outline' : 'return-down-back-outline'}
                  size={16}
                  color={Colors.accent}
                  style={isRTL ? {marginLeft: 8} : {marginRight: 8}}
                />
                <View style={{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
                  <Text style={styles.replyBarLabel}>
                    {editingMessage
                      ? t.editing_message_label
                      : `${t.reply_to_label} ${replyTo?.senderName}`}
                  </Text>
                  <Text
                    style={[styles.replyBarText, {textAlign: isRTL ? 'right' : 'left'}]}
                    numberOfLines={1}>
                    {editingMessage?.text || replyTo?.text}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setReplyTo(null);
                    setEditingMessage(null);
                    setInputText('');
                  }}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Input row ── */}
          {access !== 'allowed' && !isBlocked ? (
            <TouchableOpacity accessibilityRole="button" onPress={() => setReload(v => v + 1)} style={{padding: 20, backgroundColor: Colors.surface}}>
              <Text style={styles.historyText}>{access === 'waiting' ? (hbsText(isRTL, 'ui_chat_is_unavailable_open_their_profile_to_check_')) : access === 'checking' ? (hbsText(isRTL, 'ui_checking_messaging_permission')) : (hbsText(isRTL, 'ui_could_not_verify_messaging_permission_tap_to_ret'))}</Text>
            </TouchableOpacity>
          ) : !isBlocked ? (
            <View
              style={[
                styles.inputRow,
                {
                  flexDirection: rowDir,
                  paddingBottom:
                    keyboardHeight > 0 ? 6 : Math.max(insets.bottom, 6),
                },
              ]}>
              <TouchableOpacity
                style={[styles.attachBtn, isRTL ? {marginRight: 4} : {marginLeft: 4}]}
                onPress={handleAttach}
                disabled={mediaUploading}>
                {mediaUploading ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <Ionicons name="add-circle-outline" size={24} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
              <View style={styles.inputBox}>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.textInput,
                    {textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr'},
                  ]}
                  placeholder={t.message_placeholder}
                  placeholderTextColor={Colors.textMuted}
                  value={inputText}
                  onChangeText={onInputChange}
                  multiline
                  maxLength={1000}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  {backgroundColor: inputText.trim() && !sending ? Colors.accent : Colors.surface},
                ]}
                onPress={onSend}
                disabled={!inputText.trim() || sending}>
                {sending ? (
                  <ActivityIndicator size="small" color={Colors.onAccent} />
                ) : (
                  <Ionicons
                    name={editingMessage ? 'checkmark' : 'send'}
                    size={18}
                    color={inputText.trim() ? Colors.onAccent : Colors.textMuted}
                  />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.blockedFooter,
                {paddingBottom: insets.bottom + 16, flexDirection: rowDir},
              ]}>
              <Ionicons
                name="ban-outline"
                size={16}
                color={Colors.textMuted}
                style={isRTL ? {marginLeft: 6} : {marginRight: 6}}
              />
              <Text style={styles.blockedText}>
                {iBlockedThem ? t.blocked_user_footer : t.cannot_reply}
              </Text>
            </View>
          )}
          </View>

      </View>

      <WhatsAppMessageModal
        visible={msgModalVisible}
        onClose={() => setMsgModalVisible(false)}
        messageText={msgModalTarget?.text}
        isMe={msgModalIsMe}
        messageY={msgModalY}
        currentUserEmoji={msgModalTarget?.reactions?.[currentUserIdRef.current] || null}
        onReact={handleReact}
        actions={msgModalActions}
      />
      <DeleteMessageModal
        visible={deleteModalVisible}
        onClose={() => { setDeleteModalVisible(false); setDeletingMsg(null); }}
        isMe={String(deletingMsg?.senderId) === currentUserIdRef.current}
        onDeleteForEveryone={() => {
          getSocket()?.emit('delete-message', {
            messageId: deletingMsg?._id,
            chatId,
            deleteForEveryone: true,
          });
          setDeletingMsg(null);
          setDeleteModalVisible(false);
        }}
        onDeleteForMe={() => {
          getSocket()?.emit('delete-message', {
            messageId: deletingMsg?._id,
            chatId,
            deleteForEveryone: false,
          });
          setMessages(prev => prev.filter(m => m._id !== deletingMsg?._id));
          setDeletingMsg(null);
          setDeleteModalVisible(false);
        }}
      />
      <ImageViewerModal
        visible={!!imageViewer}
        uri={imageViewer?.uri || null}
        senderName={imageViewer?.senderName}
        timestamp={imageViewer?.timestamp}
        onClose={() => setImageViewer(null)}
      />
      <AttachmentSheet
        visible={attachSheetOpen}
        onClose={() => setAttachSheetOpen(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  datePill: {alignSelf: 'center', backgroundColor: Colors.surfaceRaised, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 12, marginVertical: 14},
  historyNotice: {padding: 20, alignItems: 'center'},
  historyText: {color: Colors.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18},
  retryText: {color: Colors.accent, fontSize: 12, textAlign: 'right', padding: 8},
  latestButton: {position: 'absolute', bottom: 14, right: 16, minHeight: 44, backgroundColor: Colors.border, borderRadius: 22, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5},
  safeArea: {flex: 1, backgroundColor: Colors.surface},
  container: {flex: 1, backgroundColor: Colors.surface},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface},
  msgRow: {marginVertical: 1},
  rowRight: {alignItems: 'flex-end'},
  rowLeft: {alignItems: 'flex-start'},
  bubble: {maxWidth: '82%', borderRadius: 18, paddingHorizontal: 11, paddingTop: 7, paddingBottom: 5},
  bubbleRight: {backgroundColor: Colors.accentSoft, borderBottomRightRadius: 3},
  bubbleLeft: {backgroundColor: Colors.surfaceRaised, borderBottomLeftRadius: 3},
  imageBubble: {maxWidth: 260, borderRadius: 16, overflow: 'hidden'},
  imageBubbleRight: {borderBottomRightRadius: 3},
  imageBubbleLeft: {borderBottomLeftRadius: 3},
  mediaImageFull: {width: 260, height: 200},
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlaySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  uploadOverlayText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  imageTimeOverlay: {
    position: 'absolute', bottom: 6, right: 8,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.overlaySoft, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  imageTime: {color: Colors.white, fontSize: 11},
  mediaImagePadded: {width: 220, height: 160, borderRadius: 10, marginBottom: 2},
  textWithTime: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end'},
  msgText: {fontSize: 15, lineHeight: 21, flexShrink: 1},
  msgTextDark: {color: Colors.textPrimary},
  timeSpacer: {color: Colors.transparent, fontSize: 11},
  inlineTime: {marginLeft: 'auto' as any, paddingBottom: 1},
  msgFooter: {flexDirection: 'row', alignItems: 'center'},
  msgFooterRow: {flexDirection: 'row', justifyContent: 'flex-end', marginTop: 3},
  msgTime: {fontSize: 11},
  editedLabel: {fontSize: 11, fontStyle: 'italic', marginRight: 2},
  replyPreview: {
    flexDirection: 'row', maxWidth: '82%', marginBottom: 2,
    backgroundColor: Colors.overlaySubtle, borderRadius: 12, overflow: 'hidden',
  },
  replyRight: {alignSelf: 'flex-end'},
  replyLeft: {alignSelf: 'flex-start'},
  replyAccent: {width: 3, backgroundColor: Colors.brandGreen},
  replyName: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  replyText: {fontSize: 12, color: Colors.textSecondary},
  videoThumb: {
    width: 220, height: 160, borderRadius: 10, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  docRow: {alignItems: 'center', gap: 10, paddingVertical: 4, maxWidth: 220},
  docIconWrap: {width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center'},
  docName: {fontSize: 13, fontWeight: '600', flex: 1},
  deletedBubble: {
    alignItems: 'center', backgroundColor: Colors.overlaySubtle,
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8,
  },
  deletedText: {fontStyle: 'italic', color: Colors.textMuted, fontSize: 13},
  typingDots: {flexDirection: 'row', gap: 4, alignItems: 'center'},
  dot: {width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.surface},
  reactionsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: '82%'},
  reactionsRight: {alignSelf: 'flex-end'},
  reactionsLeft: {alignSelf: 'flex-start'},
  reactionChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 3,
  },
  reactionChipMine: {borderColor: Colors.brandGreen, backgroundColor: Colors.surface},
  reactionEmoji: {fontSize: 15},
  reactionCount: {fontSize: 11, color: Colors.textSecondary, fontWeight: '600'},
  swipeReplyIcon: {
    position: 'absolute', left: 4, top: '50%', marginTop: -14,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.overlaySubtle,
    justifyContent: 'center', alignItems: 'center', zIndex: -1,
  },
  composerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 20,
    backgroundColor: Colors.background,
  },

  replyBarOuter: {
    backgroundColor: Colors.surface, borderTopWidth: 0.5,
    borderTopColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8,
  },
  replyBarInner: {alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 8},
  replyBarLabel: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  replyBarText: {fontSize: 13, color: Colors.textSecondary, marginTop: 1},
  inputRow: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    marginBottom: 0,
    backgroundColor: Colors.background,
  },
  attachBtn: {width: 32, height: 36, justifyContent: 'center', alignItems: 'center'},
  // ✅ FIX: inputBox SAFAID tha aur textInput ka color bhi SAFAID —
  //    type karte waqt kuch nazar hi nahi aata tha. Ab input dark hai
  //    (app ke theme jaisa) aur text safaid. Placeholder bhi set kiya.
  inputBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 15,

    minHeight: 40,
    maxHeight: 60,
    marginRight: 10,
  },
  textInput: {fontSize: 15, lineHeight: 20, color: Colors.textPrimary, padding: 0},
  sendBtn: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center'},
  blockedFooter: {
    alignItems: 'center', justifyContent: 'center', padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  blockedText: {color: Colors.textSecondary, fontSize: 14},
});
