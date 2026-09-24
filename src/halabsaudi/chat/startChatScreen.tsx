import UserAvatar from '../Component/UserAvatar';
import type {HalaStackParamList} from '../Navigation/types';
import {Text} from '../../ui/Text';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {bioPreview} from './socialProfile';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList, TouchableOpacity, StyleSheet, Platform, Image,TextInput, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {languageData} from '../redux_toolkit/language/languageSlice';
import {RootState} from '../redux_toolkit/store';
import {useStatusBar} from '../Component/UseStatusBar/useStatusBar';

type FollowStatus = 'none' | 'pending' | 'accepted';
type User = {
  _id: string; name: string; bio?: string | null; avatar?: string | null; isOnline?: boolean;
  privacySettings?: {isPrivate?: boolean};
  canMessage?: boolean; // backend bheje to wahi final
  relationship?: {followingStatus: FollowStatus; followedByStatus: FollowStatus};
};
type PeopleCache = {ownerId: string; fetchedAt: number; users: User[]; blocked: string[]};
type FetchResult = {cache: PeopleCache; usersFailed: boolean};
type SectionItem =
  | {type: 'label'; label: string; key: string}
  | ({type: 'user'; key: string} & User);

type Props = NativeStackScreenProps<HalaStackParamList, 'StartChatScreen'>;

const PAGE_SIZE       = 50;             // "Add new friend" mein sirf 50 log
const CACHE_TTL       = 5 * 60 * 1000;  // 5 min tak server ko dobara call nahi
const SEARCH_DEBOUNCE = 400;            // typing rukne ke 400ms baad server search

const CACHE_KEY_USERS   = 'hala_users_cache_v2';
const CACHE_KEY_BLOCKED = 'hala_blocked_cache';
const CACHE_KEY_META    = 'hala_users_cache_meta'; // {ownerId, fetchedAt}


// Memory cache: screen dobara khule to data foran, disk read bhi nahi
let _mem: PeopleCache | null = null;
// Ek waqt mein ek hi network request, chahe screen baar baar khule
let _inflight: Promise<FetchResult> | null = null;

// Logout aur block/unblock ke baad call karein taake agli dafa fresh list aaye
export function clearPeopleCache() {
  _mem = null;
  Promise.all([
    AsyncStorage.removeItem(CACHE_KEY_USERS),
    AsyncStorage.removeItem(CACHE_KEY_META),
  ]).catch(() => {});
}

function parse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// /api/users { users, page, hasMore } deta hai — purana array format bhi chalega
function toUsers(data: any): User[] {
  const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
  return list.slice(0, PAGE_SIZE);
}

function getMyId(token: string): string {
  try {
    const {jwtDecode} = require('jwt-decode');
    const decoded: any = jwtDecode(token);
    return String(decoded?.id || decoded?._id || '');
  } catch {
    return '';
  }
}

async function readDiskCache(myId: string): Promise<PeopleCache | null> {
  const [uRaw, bRaw, mRaw] = await Promise.all([
    AsyncStorage.getItem(CACHE_KEY_USERS),
    AsyncStorage.getItem(CACHE_KEY_BLOCKED),
    AsyncStorage.getItem(CACHE_KEY_META),
  ]);
  const users   = parse<User[]>(uRaw);
  const blocked = parse<string[]>(bRaw) || [];
  const meta    = parse<{ownerId: string; fetchedAt: number}>(mRaw);
  // Kisi aur account ka cache kabhi na dikhe
  if (!users || !meta || meta.ownerId !== myId) return null;
  return {ownerId: myId, fetchedAt: meta.fetchedAt || 0, users: users.slice(0, PAGE_SIZE), blocked};
}

async function fetchPeople(token: string, myId: string): Promise<FetchResult> {
  const headers = {Authorization: `Bearer ${token}`};
  const [uRes, bRes] = await Promise.allSettled([
    // fetchCollection ki jagah seedha axios, taake pakka sirf pehla page (50) aaye
    axios.get(`${BASE_URL}/api/users`, {params: {limit: PAGE_SIZE, page: 1}, headers, timeout: 15000}),
    axios.get(`${BASE_URL}/api/block/blocked-list`, {headers, timeout: 15000}),
  ]);

  const freshUsers = uRes.status === 'fulfilled' ? toUsers(uRes.value.data) : null;
  const freshBlocked: string[] | null =
    bRes.status === 'fulfilled' && Array.isArray(bRes.value.data)
      ? bRes.value.data.map((x: any) => String(x.blocked?._id || x.blocked))
      : null;

  const prev = _mem?.ownerId === myId ? _mem : null;
  const cache: PeopleCache = {
    ownerId:   myId,
    fetchedAt: freshUsers ? Date.now() : prev?.fetchedAt ?? 0,
    users:     freshUsers ?? prev?.users ?? [],
    blocked:   freshBlocked ?? prev?.blocked ?? [],
  };
  _mem = cache;

  const writes: Promise<void>[] = [];
  if (freshUsers) {
    writes.push(AsyncStorage.setItem(CACHE_KEY_USERS, JSON.stringify(cache.users)));
    writes.push(AsyncStorage.setItem(CACHE_KEY_META, JSON.stringify({ownerId: myId, fetchedAt: cache.fetchedAt})));
  }
  if (freshBlocked) writes.push(AsyncStorage.setItem(CACHE_KEY_BLOCKED, JSON.stringify(cache.blocked)));
  Promise.all(writes).catch(() => {});

  return {cache, usersFailed: !freshUsers};
}

export default function StartChatScreen({navigation}: Props) {
  useStatusBar('light-content', Colors.darkgrey);
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const [users,           setUsers]           = useState<User[]>(_mem?.users ?? []);
  const [blockedUserIds,  setBlockedUserIds]  = useState<string[]>(_mem?.blocked ?? []);
  const [loading,         setLoading]         = useState(!_mem?.users.length);
  const [refreshing,      setRefreshing]      = useState(false);
  const [loadError,       setLoadError]       = useState(false);
  const [search,          setSearch]          = useState('');
  const [remote,          setRemote]          = useState<{q: string; list: User[]} | null>(null);
  const [searching,       setSearching]       = useState(false);

  const tokenRef     = useRef('');
  const myUserIdRef  = useRef('');
  const cancelledRef = useRef(false);
  const searchReqRef = useRef(0);

  useEffect(() => {
    cancelledRef.current = false;
    return () => { cancelledRef.current = true; };
  }, []);

  const showCache = useCallback((cache: PeopleCache) => {
    if (cancelledRef.current) return;
    setUsers(cache.users);
    setBlockedUserIds(cache.blocked);
    if (cache.users.length) setLoading(false);
  }, []);

  // force = true sirf pull-to-refresh / retry par
  const load = useCallback(async (force = false) => {
    try {
      const token = await AsyncStorage.getItem('hala_token');
      if (!token) return;
      tokenRef.current = token;
      const myId = getMyId(token);
      myUserIdRef.current = myId;

      // 1) Saved list foran dikhao (pehle memory, phir disk)
      if (_mem?.ownerId !== myId) {
        _mem = await readDiskCache(myId);
        if (!_mem && !cancelledRef.current) {
          setUsers([]);
          setBlockedUserIds([]);
          setLoading(true);
        }
      }
      if (_mem) showCache(_mem);

      // 2) Cache fresh hai to server ko call hi nahi
      if (!force && _mem && Date.now() - _mem.fetchedAt < CACHE_TTL) return;

      // 3) Server se naya data — pehle se request chal rahi ho to wahi use karo
      const job = _inflight ?? (_inflight = fetchPeople(token, myId).finally(() => { _inflight = null; }));
      const {cache, usersFailed} = await job;
      showCache(cache);
      if (!cancelledRef.current) setLoadError(usersFailed);
    } catch {
      if (!cancelledRef.current) setLoadError(true);
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [showCache]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  // Search: local 50 mein foran, aur 2+ letters par server se bhi (debounced)
  useEffect(() => {
    const reqId = ++searchReqRef.current;
    const raw = search.trim();
    if (raw.length < 2) {
      setRemote(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const token = tokenRef.current || (await AsyncStorage.getItem('hala_token')) || '';
        const res = await axios.get(`${BASE_URL}/api/users`, {
          params: {search: raw, limit: PAGE_SIZE, page: 1},
          headers: {Authorization: `Bearer ${token}`}, timeout: 10000,
        });
        if (reqId === searchReqRef.current && !cancelledRef.current) {
          setRemote({q: raw.toLowerCase(), list: toUsers(res.data)});
        }
      } catch {
        // Server search fail ho to local results dikhte rahenge
      } finally {
        if (reqId === searchReqRef.current && !cancelledRef.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [search]);

  const q = search.trim().toLowerCase();
  const visibleUsers = useMemo(() => {
    const blocked = new Set(blockedUserIds);
    let list = users;
    // Server search ke results local 50 ke saath merge (duplicate ke baghair)
    if (remote && q.startsWith(remote.q)) {
      const have = new Set(users.map(u => String(u._id)));
      list = [...users, ...remote.list.filter(u => !have.has(String(u._id)))];
    }
    return list.filter(u =>
      !blocked.has(String(u._id)) && (!q || (u.name || '').toLowerCase().includes(q)),
    );
  }, [users, remote, blockedUserIds, q]);

  const onlineUsers  = visibleUsers.filter(u => u.isOnline);
  const offlineUsers = visibleUsers.filter(u => !u.isOnline);

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

  const renderItem = ({item}: {item: SectionItem}) => {
    if (item.type === 'label') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, {textAlign: isRTL ? 'right' : 'left'}]}>{item.label}</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.row, {flexDirection: rowDir}]}
        onPress={() => navigation.navigate('UserProfile', {participantId: item._id, participantName: item.name})}
        activeOpacity={0.72}
        accessibilityRole="button" accessibilityLabel={item.name}>

        <View style={[styles.avatarWrap, isRTL ? {marginLeft: 14, marginRight: 0} : {marginRight: 14}]}>
          <UserAvatar uri={item.avatar} style={styles.avatarImg} />
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={[styles.rowInfo, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
          <View style={[styles.nameLine, {flexDirection: rowDir}]}>
            <Text style={[styles.rowName, {textAlign: isRTL ? 'right' : 'left'}]}>{item.name}</Text>
            {item.privacySettings?.isPrivate && <Ionicons name="lock-closed" size={12} color={Colors.Grey9} />}
          </View>
          {/* <Text style={{color: Colors.Grey9, fontSize: 13, marginTop: 4, lineHeight: 18, textAlign: isRTL ? 'right' : 'left'}}>{bioPreview(item.bio)}</Text> */}
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header: SocialConnectionsScreen jaisa simple ── */}
      <View style={[styles.header, {flexDirection: rowDir}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={Colors.White} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{t.add_new_friend}</Text>
        <View style={styles.back} />
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, {flexDirection: rowDir}]}>
          <Ionicons name="search-outline" size={16} color={Colors.White} />
          <TextInput
            placeholder={t.search_members}
            placeholderTextColor="rgba(255,255,255,0.4)"
            underlineColorAndroid="transparent"
            autoCorrect={false}
            autoCapitalize="none"
            style={[styles.searchInput, {textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr'}]}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color={Colors.btnRed} />}
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Ionicons name="close-circle" size={17} color={Colors.btnRed} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── List ── */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.Red} />
            <Text style={styles.loaderText}>{t.finding_people}</Text>
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(item: SectionItem) => item.key}
            renderItem={renderItem}
            ListHeaderComponent={loadError && !q ? (
              <TouchableOpacity onPress={onRefresh} style={{padding: 16}}>
                <Text style={{color: '#FF827C', textAlign: 'center'}}>
                  {isRTL ? 'تعذر تحديث الأشخاص · إعادة المحاولة' : 'Could not refresh people · Tap to retry'}
                </Text>
              </TouchableOpacity>
            ) : null}
            ListEmptyComponent={searching ? null : (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyRing}><Text style={styles.emptyEmoji}>🌿</Text></View>
                <Text style={styles.emptyTitle}>{t.no_members_found}</Text>
                <Text style={styles.emptySub}>{t.try_different_search}</Text>
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.btnRed}
                colors={[Colors.btnRed]}
                progressBackgroundColor={Colors.darkgrey}
              />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[styles.listContent, sections.length === 0 && {flex: 1}]}
            ItemSeparatorComponent={() => <View style={{height: 8}} />}
            windowSize={11}
            maxToRenderPerBatch={15}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          {flex: 1, backgroundColor: Colors.darkgrey},
  header:        {height: 58, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14},
  back:          {width: 38, height: 38, justifyContent: 'center', alignItems: 'center'},
  title:         {flex: 1, textAlign: 'center', color: Colors.White, fontSize: 17, fontWeight: '800'},
  searchWrap:    {paddingHorizontal: 14, paddingBottom: 12},
  searchBox:     {alignItems: 'center', gap: 8, height: 46, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'},
  searchInput:   {flex: 1, fontSize: 15, color: Colors.White, backgroundColor: 'transparent', borderWidth: 0, margin: 0, paddingVertical: 0, paddingHorizontal: 0, includeFontPadding: false},
  body:          {flex: 1, backgroundColor: Colors.dargBg},
  loaderWrap:    {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14},
  loaderText:    {color: Colors.Red, fontSize: 14, marginTop: 4, fontWeight: '500'},
  listContent:   {paddingHorizontal: 14, paddingTop: 14, paddingBottom: 40},
  sectionHeader: {paddingHorizontal: 4, paddingTop: 8, paddingBottom: 6},
  sectionLabel:  {fontSize: 11, fontWeight: '700', color: Colors.btnRed, letterSpacing: 0.2, textTransform: 'uppercase'},
  row:           {alignItems: 'center', backgroundColor: '#191B20', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, shadowColor: '#1A202C', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8},
  avatarWrap:    {position: 'relative', flexShrink: 0},
  avatarImg:     {width: 50, height: 50, borderRadius: 25},
  avatarCircle:  {width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center'},
  avatarLetter:  {color: Colors.White, fontSize: 19, fontWeight: '800'},
  onlineDot:     {width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.btnRed, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: Colors.White},
  rowInfo:       {flex: 1},
  nameLine:      {alignItems: 'center', gap: 5},
  rowName:       {fontSize: 15, fontWeight: '700', color: Colors.White},
  followChip:    {minWidth: 72, alignItems: 'center', backgroundColor: Colors.btnRed, borderRadius: 18, paddingHorizontal: 9, paddingVertical: 7, marginRight: 8},
  followingChip: {backgroundColor: '#191B20', borderWidth: 1, borderColor: '#343841'},
  followChipText:{color: Colors.White, fontSize: 11, fontWeight: '700'},
  msgChip:       {alignItems: 'center', backgroundColor: '#191B20', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.btnRed},
  msgChipText:   {color: Colors.btnRed, fontSize: 12, fontWeight: '700'},
  msgChipLocked: {borderColor: '#343841'},
  msgChipTextLocked: {color: Colors.Grey9},
  emptyWrap:     {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10, marginTop: 80},
  emptyRing:     {width: 84, height: 84, borderRadius: 42, backgroundColor: '#191B20', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 3, borderColor: Colors.Red},
  emptyEmoji:    {fontSize: 36},
  emptyTitle:    {fontSize: 18, fontWeight: '700', color: Colors.White},
  emptySub:      {fontSize: 13, color: Colors.Grey9, textAlign: 'center'},
});
