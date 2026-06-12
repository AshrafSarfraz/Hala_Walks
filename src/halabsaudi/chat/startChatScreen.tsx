import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Platform,  Image,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {getAvatarColor} from '../Themes/avatarColor';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {languageData} from '../redux_toolkit/language/languageSlice';
import {RootState} from '../redux_toolkit/store';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';

type User = {_id: string; name: string; avatar?: string | null; isOnline?: boolean};

type RootStackParamList = {
  ChatScreen: {
    chatId: string;
    participantName: string;
    participantId: string;
    participantAvatar?: string | null;
    participantHidesOnline?: boolean;
    participantHidesLastSeen?: boolean;
    isBlockedInitial?: boolean;
    // ✅ NEW: agar naya chat hai toh yeh pass karo
    isPendingChat?: boolean;
  };
};
type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

const CACHE_KEY_USERS   = 'hala_users_cache';
const CACHE_KEY_BLOCKED = 'hala_blocked_cache';
const CACHE_KEY_CONVS   = 'hala_conversations';

let _memUsers:   User[]   = [];
let _memBlocked: string[] = [];
let _memLoaded  = false;

export default function StartChatScreen({navigation}: Props) {
   useStatusBar('light-content', Colors.Green, true);
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const [users,          setUsers]          = useState<User[]>(_memUsers);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(_memBlocked);
  const [loading,        setLoading]        = useState(!_memLoaded);
  const [search,         setSearch]         = useState('');
  const [navigatingId,   setNavigatingId]   = useState<string | null>(null);

  const tokenRef     = useRef('');
  const cancelledRef = useRef(false);
  const myUserIdRef  = useRef('');

  useEffect(() => {
    cancelledRef.current = false;
    return () => { cancelledRef.current = true; };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (!_memLoaded) {
          try {
            const [uRaw, bRaw] = await Promise.all([
              AsyncStorage.getItem(CACHE_KEY_USERS),
              AsyncStorage.getItem(CACHE_KEY_BLOCKED),
            ]);
            if (uRaw) {
              const u: User[] = JSON.parse(uRaw);
              _memUsers = u;
              if (!cancelledRef.current) setUsers(u);
            }
            if (bRaw) {
              const b: string[] = JSON.parse(bRaw);
              _memBlocked = b;
              if (!cancelledRef.current) setBlockedUserIds(b);
            }
          } catch {}
          if (!cancelledRef.current) setLoading(false);
        }

        const token = await AsyncStorage.getItem('hala_token');
        if (!token || cancelledRef.current) return;
        tokenRef.current = token;

        // Get my userId from token
        try {
          const {jwtDecode} = require('jwt-decode');
          const decoded: any = jwtDecode(token);
          myUserIdRef.current = String(decoded?.id || decoded?._id || '');
        } catch {}

        const [uRes, bRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/users`, {
            headers: {Authorization: `Bearer ${token}`}, timeout: 15000,
          }),
          axios.get(`${BASE_URL}/api/chat/blocked-list`, {
            headers: {Authorization: `Bearer ${token}`}, timeout: 15000,
          }),
        ]);

        if (cancelledRef.current) return;

        if (uRes.status === 'fulfilled') {
          const u: User[] = Array.isArray(uRes.value.data) ? uRes.value.data : [];
          _memUsers = u; _memLoaded = true;
          if (!cancelledRef.current) setUsers(u);
          AsyncStorage.setItem(CACHE_KEY_USERS, JSON.stringify(u)).catch(() => {});
        }
        if (bRes.status === 'fulfilled') {
          const b: string[] = Array.isArray(bRes.value.data)
            ? bRes.value.data.map((x: any) => String(x.blocked)) : [];
          _memBlocked = b;
          if (!cancelledRef.current) setBlockedUserIds(b);
          AsyncStorage.setItem(CACHE_KEY_BLOCKED, JSON.stringify(b)).catch(() => {});
        }
      } catch (e: any) {
        console.log('[StartChat] load error:', e?.message);
      } finally {
        if (!cancelledRef.current) setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ MAIN FIX: Hamesha turant navigate karo — WhatsApp jaisa
  const openChat = useCallback(async (user: User) => {
    if (navigatingId) return;
    setNavigatingId(user._id);

    try {
      const token = tokenRef.current || (await AsyncStorage.getItem('hala_token')) || '';

      // ── Step 1: Fast API try (3 sec) ─────────────────────────────────────
      try {
        const res = await axios.post(
          `${BASE_URL}/api/chat/with/${user._id}`, {},
          {headers: {Authorization: `Bearer ${token}`}, timeout: 3000},
        );
        const chat = res.data;
        if (!cancelledRef.current) {
          navigation.navigate('ChatScreen', {
            chatId:                   chat._id,
            participantName:          chat.participant?.name || user.name,
            participantId:            chat.participant?._id  || user._id,
            participantAvatar:        user.avatar || null,
            participantHidesOnline:   chat.participant?.participantHidesOnline   || false,
            participantHidesLastSeen: chat.participant?.participantLastSeen === null,
            isPendingChat:            false,
          });
        }
        return;
      } catch {
        // API failed or slow — continue offline
      }

      // ── Step 2: Check conversations cache ─────────────────────────────────
      try {
        const convRaw = await AsyncStorage.getItem(CACHE_KEY_CONVS);
        if (convRaw) {
          const convs: any[] = JSON.parse(convRaw);
          const existing = convs.find(
            c => String(c.participant?._id) === String(user._id),
          );
          if (existing) {
            // Purana chat mila — real chatId se navigate karo
            if (!cancelledRef.current) {
              navigation.navigate('ChatScreen', {
                chatId:                   existing._id,
                participantName:          user.name,
                participantId:            user._id,
                participantAvatar:        user.avatar || null,
                participantHidesOnline:   existing.participantHidesOnline   || false,
                participantHidesLastSeen: existing.participantLastSeen === null,
                isPendingChat:            false,
              });
            }
            return;
          }
        }
      } catch {}

      // ── Step 3: Naya user, offline — localChatId banao, navigate karo ────
      // ✅ KEY: Koi error nahi, koi rok nahi — ChatScreen khulega
      // ChatScreen online hote hi real chat banayega aur messages bhejega
      const myId   = myUserIdRef.current || 'me';
      const localId = `local_${myId}_${user._id}`;

      if (!cancelledRef.current) {
        navigation.navigate('ChatScreen', {
          chatId:          localId,
          participantName: user.name,
          participantId:   user._id,
          participantAvatar: user.avatar || null,
          participantHidesOnline:   false,
          participantHidesLastSeen: false,
          isPendingChat:   true, // ✅ ChatScreen ko pata chalega ke naya chat hai
        });
      }

    } finally {
      setNavigatingId(null);
    }
  }, [navigation, navigatingId]);

  const filteredUsers = users.filter(
    u => !blockedUserIds.includes(String(u._id)) &&
         u.name.toLowerCase().includes(search.toLowerCase()),
  );
  const onlineUsers  = filteredUsers.filter(u => u.isOnline);
  const offlineUsers = filteredUsers.filter(u => !u.isOnline);

  type SectionItem =
    | {type: 'label'; label: string; key: string}
    | ({type: 'user'; key: string} & User);

  const sections: SectionItem[] = [
    ...(onlineUsers.length > 0 ? [
      {type: 'label' as const, label: `${t.online_label}  ·  ${onlineUsers.length}`, key: 'lbl-online'},
      ...onlineUsers.map(u => ({type: 'user' as const, key: u._id, ...u})),
    ] : []),
    ...(offlineUsers.length > 0 ? [
      {type: 'label' as const, label: t.add_new_friend, key: 'lbl-offline'},
      ...offlineUsers.map(u => ({type: 'user' as const, key: u._id, ...u})),
    ] : []),
  ];

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.LightGreen} />
        <Text style={styles.loaderText}>{t.finding_people}</Text>
      </View>
    );
  }

  const renderItem = ({item}: {item: SectionItem}) => {
    if (item.type === 'label') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, {textAlign: isRTL ? 'right' : 'left'}]}>{item.label}</Text>
        </View>
      );
    }
    const avatarBg    = getAvatarColor(item._id);
    const isNavigating = navigatingId === item._id;

    return (
      <TouchableOpacity
        style={[styles.row, {flexDirection: rowDir, opacity: isNavigating ? 0.7 : 1}]}
        onPress={() => openChat(item)}
        activeOpacity={0.72}
        disabled={!!navigatingId}>

        <View style={[styles.avatarWrap, isRTL ? {marginLeft: 14, marginRight: 0} : {marginRight: 14}]}>
          {item.avatar
            ? <Image source={{uri: item.avatar}} style={styles.avatarImg} />
            : <View style={[styles.avatarCircle, {backgroundColor: avatarBg}]}>
                <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>}
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={[styles.rowInfo, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
          <Text style={[styles.rowName, {textAlign: isRTL ? 'right' : 'left'}]}>{item.name}</Text>
        </View>

        <View style={[styles.msgChip, {flexDirection: rowDir, minWidth: 84, justifyContent: 'center'}]}>
          {isNavigating
            ? <ActivityIndicator size="small" color={Colors.Green} />
            : <>
                <Ionicons name="chatbubble-outline" size={13} color={Colors.Green} style={isRTL ? {marginLeft: 4} : {marginRight: 4}} />
                <Text style={styles.msgChipText}>{t.message}</Text>
              </>}
        </View>
      </TouchableOpacity>
    );
  };

  const memberCount = filteredUsers.length;
  const memberWord  = memberCount === 1 ? t.member_label : t.members_label;
  const onlineCount = onlineUsers.length;
  const subText     = `${memberCount} ${memberWord}${onlineCount > 0 ? `   ·   ${onlineCount} ${t.online_label}` : ''}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerRow, {flexDirection: rowDir}]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={Colors.White} />
          </TouchableOpacity>
          <View style={[styles.headerText, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
            <Text style={[styles.headerTitle, {textAlign: isRTL ? 'right' : 'left'}]}>{t.add_new_friend}</Text>
            <Text style={[styles.headerSub,   {textAlign: isRTL ? 'right' : 'left'}]}>{subText}</Text>
          </View>
        </View>
        <View style={[styles.searchBox, {flexDirection: rowDir}]}>
          <Ionicons name="search-outline" size={16} color={Colors.White} style={isRTL ? {marginLeft: 8} : {marginRight: 8}} />
          <TextInput
            placeholder={t.search_members} placeholderTextColor="rgba(255,255,255,0.4)"
            style={[styles.searchInput, {textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr'}]}
            value={search} onChangeText={setSearch} returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Ionicons name="close-circle" size={17} color={Colors.btnRed} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={sections} keyExtractor={item => item.key} renderItem={renderItem}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.listContent, sections.length === 0 && {flex: 1}]}
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
        windowSize={11} maxToRenderPerBatch={15}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyRing}><Text style={styles.emptyEmoji}>🌿</Text></View>
            <Text style={styles.emptyTitle}>{t.no_members_found}</Text>
            <Text style={styles.emptySub}>{t.try_different_search}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    {flex: 1, backgroundColor: Colors.dargBg},
  loaderWrap:   {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.darkgrey, gap: 14},
  loaderText:   {color: Colors.LightGreen, fontSize: 14, marginTop: 4, fontWeight: '500'},
  header:       {backgroundColor: Colors.darkgrey, paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 14, paddingHorizontal: 20},
  headerRow:    {alignItems: 'flex-start', gap: 12, marginBottom: 18},
  backBtn:      {width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center', marginTop: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'},
  headerText:   {flex: 1},
  headerTitle:  {fontSize: 16, fontWeight: '800', color: Colors.White, letterSpacing: -0.4},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500'},
  searchBox:    {alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'},
  searchInput:  {flex: 1, fontSize: 15, color: Colors.White, paddingVertical: 0},
  listContent:  {paddingHorizontal: 14, paddingTop: 14, paddingBottom: 40},
  sectionHeader:{paddingHorizontal: 4, paddingTop: 8, paddingBottom: 6},
  sectionLabel: {fontSize: 11, fontWeight: '700', color: Colors.btnRed, letterSpacing: 0.6, textTransform: 'uppercase'},
  row:          {alignItems: 'center', backgroundColor: Colors.White, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, shadowColor: '#1A202C', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8},
  avatarWrap:   {position: 'relative', flexShrink: 0},
  avatarImg:    {width: 50, height: 50, borderRadius: 25,tintColor: Colors.btnRed},
  avatarCircle: {width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center'},
  avatarLetter: {color: Colors.White, fontSize: 19, fontWeight: '800'},
  onlineDot:    {width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.btnRed, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: Colors.White},
  rowInfo:      {flex: 1},
  rowName:      {fontSize: 15, fontWeight: '700', color: Colors.Black2},
  msgChip:      {alignItems: 'center', backgroundColor: '#E6F2EC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.btnRed},
  msgChipText:  {color: Colors.btnRed, fontSize: 12, fontWeight: '700'},
  emptyWrap:    {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10, marginTop: 80},
  emptyRing:    {width: 84, height: 84, borderRadius: 42, backgroundColor: '#E6F2EC', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 3, borderColor: Colors.LightGreen},
  emptyEmoji:   {fontSize: 36},
  emptyTitle:   {fontSize: 18, fontWeight: '700', color: Colors.Black2},
  emptySub:     {fontSize: 13, color: Colors.Grey9, textAlign: 'center'},
});
