// import {Text} from '../../ui/Text';
// import React, {useCallback, useMemo, useState} from 'react';
// import {FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, useWindowDimensions, View} from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {useFocusEffect} from '@react-navigation/native';
// import {useSelector} from 'react-redux';
// import Ionicons from '@react-native-vector-icons/ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import {BASE_URL} from '../../config/api';
// import {theme as c} from '../../ui/theme';
// import {ActivityIndicator} from '../../ui/ActivityIndicator';
// import {unwrap, unwrapMeta} from '../api/unwrap';
// import {useStatusBar} from '../Component/UseStatusBar/useStatusBar';

// type Count = {value: number; more: boolean} | null;
// export default function MapProfile({navigation, route}: any) {
//   const {width} = useWindowDimensions();
//   const ar = useSelector((state: any) => state.language.language === 'ar');
//   const label = (en: string, arabic: string) => ar ? arabic : en;
//   const [user, setUser] = useState<any>(null);
//   const [posts, setPosts] = useState<any[]>([]);
//   const [followers, setFollowers] = useState<Count>(null);
//   const [following, setFollowing] = useState<Count>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [tab, setTab] = useState<'checkins' | 'places'>('checkins');
//   const [selected, setSelected] = useState<any>(null);
//   const [revision, setRevision] = useState(0);
//   useStatusBar('light-content', c.background);
//   useFocusEffect(useCallback(() => {
//     let active = true;
//     const controller = new AbortController();
//     async function load() {
//       try {
//         const [raw, token] = await Promise.all([AsyncStorage.getItem('hala_user_backend'), AsyncStorage.getItem('hala_token')]);
//         const account = raw ? JSON.parse(raw) : null;
//         if (!active) return;
//         setUser(account);
//         if (!token) throw new Error('Please sign in again.');
//         const key = account?._id || account?.id;
//         const cacheKey = key ? `profile_checkins_v5_${key}` : null;
//         if (cacheKey) {
//           const cached = await AsyncStorage.getItem(cacheKey);
//           if (cached && active) {setPosts(unwrap(JSON.parse(cached))); setLoading(false);}
//         }
//         const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal: controller.signal};
//         const results = await Promise.allSettled([
//           axios.get(`${BASE_URL}/api/hbs/map/my-checkins`, config),
//           axios.get(`${BASE_URL}/api/users/followers?pagination=true&limit=1`, config),
//           axios.get(`${BASE_URL}/api/users/following?pagination=true&limit=1`, config),
//         ]);
//         if (!active) return;
//         const checks = results[0];
//         if (checks.status === 'fulfilled') {
//           const items = unwrap(checks.value.data, 'checkins', 'posts');
//           setPosts(items); setError('');
//           if (cacheKey) AsyncStorage.setItem(cacheKey, JSON.stringify(items)).catch(() => {});
//         } else setError(ar ? 'تعذر تحديث الزيارات. اضغط لإعادة المحاولة.' : 'Could not refresh check-ins. Tap to retry.');
//         [setFollowers, setFollowing].forEach((set, i) => {
//           const result = results[i + 1];
//           if (result.status === 'fulfilled') {
//             const data = result.value.data;
//             const meta = unwrapMeta(data);
//             set({value: meta.total ?? unwrap(data, i === 0 ? 'followers' : 'following', 'users').length, more: meta.total === null && meta.hasMore});
//           } else set(null);
//         });
//       } catch {if (active) setError(ar ? 'تعذر تحميل الملف الشخصي. حاول مجدداً.' : 'Could not load your profile. Tap to retry.');}
//       finally {if (active) {setLoading(false); setRefreshing(false);}}
//     }
//     load();
//     return () => {active = false; controller.abort();};
//   }, [ar, revision]));
//   const places = useMemo(() => Array.from(new Map(posts.map(p => [p.location?._id || p.location?.name || p._id, p])).values()), [posts]);
//   const initials = (user?.name || 'U').split(/\s+/).slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
//   const formatCount = (count: Count) => count ? `${count.value}${count.more ? '+' : ''}` : '—';
//   const refresh = () => {setRefreshing(true); setRevision(v => v + 1);};
//   const row = {flexDirection: ar ? 'row-reverse' as const : 'row' as const};
//   const Header = <View style={s.header}>
//     <View style={[s.identity, row]}>
//       <Pressable accessibilityRole="button" accessibilityLabel={label('Edit profile', 'تعديل الملف الشخصي')} onPress={() => navigation.navigate('EditAccount')}>
//         {user?.avatar || user?.profilePhoto ? <Image source={{uri: user.avatar || user.profilePhoto}} style={s.avatar} /> : <View style={[s.avatar, s.fallback]}><Text style={s.initials}>{initials}</Text></View>}
//       </Pressable>
//       <View style={{flex: 1}}><Text style={[s.name, {textAlign: ar ? 'right' : 'left'}]}>{user?.name || label('Your profile', 'ملفك الشخصي')}</Text>
//         <Text style={s.subtitle}>{label('Your places. Your moments.', 'أماكنك. لحظاتك.')}</Text></View>
//       <Pressable accessibilityRole="button" accessibilityLabel={label('Settings', 'الإعدادات')} style={s.iconButton} onPress={() => navigation.navigate('Settings')}><Ionicons name="menu-outline" size={26} color={c.text} /></Pressable>
//     </View>
//     {!!user?.bio && <Text style={s.bio}>{user.bio}</Text>}
//     <View style={[s.stats, row]}>
//       {[
//         {value: String(posts.length), title: label('Posts', 'المنشورات'), action: () => setTab('checkins')},
//         {value: formatCount(following), title: label('Following', 'أتابع'), action: () => navigation.navigate('SocialConnections', {mode: 'following'})},
//         {value: formatCount(followers), title: label('Followers', 'المتابعون'), action: () => navigation.navigate('SocialConnections', {mode: 'followers'})},
//       ].map(stat => <Pressable key={stat.title} accessibilityRole="button" style={s.stat} onPress={stat.action}><Text style={s.number}>{stat.value}</Text><Text style={s.statLabel}>{stat.title}</Text></Pressable>)}
//     </View>
//     <View style={[s.tabs, row]}>{(['checkins', 'places'] as const).map(key => <Pressable key={key} accessibilityRole="tab" accessibilityState={{selected: tab === key}} style={[s.tab, tab === key && s.activeTab]} onPress={() => setTab(key)}><Ionicons name={key === 'checkins' ? 'grid-outline' : 'location-outline'} size={18} color={tab === key ? c.text : c.muted} /><Text style={[s.tabText, tab === key && {color: c.text}]}>{key === 'checkins' ? label('Check-ins', 'الزيارات') : label('Places', 'الأماكن')}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel={label('Add friends', 'إضافة أصدقاء')} style={s.addButton} onPress={() => navigation.navigate('StartChatScreen')}><Ionicons name="person-add-outline" size={17} color={c.text} /><Text style={s.buttonText}>{label('Add+', 'إضافة +')}</Text></Pressable></View>
//     {!!error && <Pressable onPress={refresh} style={s.error}><Text style={s.muted}>{error}</Text></Pressable>}
//   </View>;
//   return <SafeAreaView style={s.safe} edges={route?.name === 'Profile' ? ['top'] : ['top', 'bottom']}>
//     <FlatList key={tab} data={tab === 'checkins' ? posts : places} numColumns={3}
//       keyExtractor={(item, i) => String(item._id || i)} ListHeaderComponent={Header}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.accent} colors={[c.accent]} />}
//       contentContainerStyle={{paddingBottom: 24, flexGrow: 1}} showsVerticalScrollIndicator={false}
//       renderItem={({item}) => <Pressable accessibilityRole="button" accessibilityLabel={item.location?.name || label('Open check-in', 'عرض الزيارة')} onPress={() => setSelected(item)} style={[s.tile, {width: width / 3 - 2, height: width / 3 - 2}]}>
//         {!!item.image && <Image source={{uri: item.image}} style={StyleSheet.absoluteFillObject} />}
//         {tab === 'places' && <View style={s.tileCaption}><Text numberOfLines={2} style={s.placeName}>{item.location?.name || label('Place', 'مكان')}</Text></View>}
//       </Pressable>}
//       ListEmptyComponent={<View style={s.empty}>{loading ? <ActivityIndicator size="large" /> : <><Ionicons name="camera-outline" size={38} color={c.muted} /><Text style={s.emptyTitle}>{label('Your story starts here', 'قصتك تبدأ هنا')}</Text><Text style={s.muted}>{label('Check in to a place to add your first moment.', 'سجّل زيارتك لمكان لإضافة أول لحظة.')}</Text><Pressable accessibilityRole="button" style={[s.secondary, {marginTop: 20}]} onPress={() => navigation.navigate('Timeline')}><Text style={s.buttonText}>{label('Create a check-in', 'إضافة زيارة')}</Text></Pressable></>}</View>}
//     />
//     <Modal visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}>
//       <SafeAreaView style={s.safe}><View style={s.viewerHeader}><Text style={[s.name, {flex: 1}]} numberOfLines={1}>{selected?.location?.name || label('Check-in', 'زيارة')}</Text><Pressable accessibilityRole="button" accessibilityLabel={label('Close', 'إغلاق')} style={s.iconButton} onPress={() => setSelected(null)}><Ionicons name="close" size={26} color={c.text} /></Pressable></View>
//         {!!selected?.image && <Image source={{uri: selected.image}} style={{flex: 1}} resizeMode="contain" />}
//         <View style={{padding: 24}}><Text style={s.bio}>{selected?.caption}</Text>{!!selected?.createdAt && <Text style={s.muted}>{new Date(selected.createdAt).toLocaleDateString(ar ? 'ar' : 'en', {day: 'numeric', month: 'long', year: 'numeric'})}</Text>}</View>
//       </SafeAreaView>
//     </Modal>
//   </SafeAreaView>;
// }
// const s = StyleSheet.create({
//   safe: {flex: 1, backgroundColor: c.background}, header: {paddingTop: 20}, identity: {alignItems: 'center', gap: 14, paddingHorizontal: 20},
//   avatar: {width: 72, height: 72, borderRadius: 36, backgroundColor: c.raised}, fallback: {alignItems: 'center', justifyContent: 'center'}, initials: {fontSize: 25, fontWeight: '700', color: c.text},
//   name: {fontSize: 22, fontWeight: '700', color: c.text}, subtitle: {fontSize: 12, lineHeight: 18, color: c.muted, marginTop: 5}, iconButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
//   bio: {fontSize: 15, lineHeight: 22, color: c.text, marginHorizontal: 20, marginTop: 14}, stats: {marginHorizontal: 20, marginVertical: 24}, stat: {flex: 1, alignItems: 'center', minHeight: 48}, number: {fontSize: 23, fontWeight: '700', color: c.text}, statLabel: {fontSize: 13, color: c.muted, marginTop: 5},
//   actions: {gap: 10, marginHorizontal: 20, marginBottom: 24}, secondary: {flexDirection: 'row', gap: 8, flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14}, primary: {backgroundColor: c.accent}, buttonText: {color: c.text, fontSize: 14, fontWeight: '600'},
//   addButton: {flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent, borderRadius: 10, minHeight: 44, paddingHorizontal: 14, marginHorizontal: 8},
//   tabs: {alignItems: 'center', borderBottomColor: c.border, borderBottomWidth: 1, marginBottom: 2}, tab: {flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', minHeight: 52, borderBottomWidth: 2, borderBottomColor: 'transparent'}, activeTab: {borderBottomColor: c.accent}, tabText: {fontSize: 14, color: c.muted, fontWeight: '600'},
//   tile: {margin: 1, backgroundColor: c.surface}, tileCaption: {position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: c.overlay}, placeName: {color: c.text, fontSize: 12, fontWeight: '600'},
//   empty: {alignItems: 'center', padding: 32, gap: 12}, emptyTitle: {fontSize: 20, color: c.text, fontWeight: '600'}, muted: {fontSize: 14, lineHeight: 21, color: c.muted, textAlign: 'center'}, error: {padding: 14, backgroundColor: c.accentSoft}, viewerHeader: {flexDirection: 'row', alignItems: 'center', padding: 16},
// });



import FastImage from 'react-native-fast-image';
import {Text} from '../../ui/Text';
import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, useWindowDimensions, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config/api';
import {theme as c} from '../../ui/theme';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {unwrap, unwrapMeta} from '../api/unwrap';
import {useStatusBar} from '../Component/UseStatusBar/useStatusBar';

function ProfilePhoto({uri, contain = false}: {uri: string; contain?: boolean}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  return <View style={{flex: 1, width: '100%', backgroundColor: c.surface}}>
    <FastImage key={`${uri}_${attempt}`} source={{uri: uri.trim(), priority: contain ? FastImage.priority.high : FastImage.priority.normal, cache: FastImage.cacheControl.web}}
      style={StyleSheet.absoluteFillObject} resizeMode={contain ? FastImage.resizeMode.contain : FastImage.resizeMode.cover}
      onLoad={() => setState('ready')} onError={() => setState('error')} />
    {state === 'loading' && <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, {alignItems: 'center', justifyContent: 'center'}]}><ActivityIndicator /></View>}
    {state === 'error' && <Pressable accessibilityRole="button" accessibilityLabel="Retry image" style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} onPress={() => {setState('loading'); setAttempt(v => v + 1);}}><Ionicons name="image-outline" size={24} color={c.muted} /><Text style={{color: c.muted, fontSize: 12}}>Tap to retry</Text></Pressable>}
  </View>;
}

type Count = {value: number; more: boolean} | null;
export default function MapProfile({navigation, route}: any) {
  const {width} = useWindowDimensions();
  const ar = useSelector((state: any) => state.language.language === 'ar');
  const label = (en: string, arabic: string) => ar ? arabic : en;
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<Count>(null);
  const [following, setFollowing] = useState<Count>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'checkins' | 'places'>('checkins');
  const [selected, setSelected] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const closeViewer = () => {setSelected(null); setConfirmDelete(false); setDeleteError('');};
  const deletePost = async () => {
    if (!selected?._id || deleting) return;
    setDeleting(true); setDeleteError('');
    try {
      const token = await AsyncStorage.getItem('hala_token');
      await axios.delete(`${BASE_URL}/api/hbs/map/photos/${selected._id}`, {headers: {Authorization: `Bearer ${token}`}, timeout: 15000});
      const remaining = posts.filter(p => String(p._id) !== String(selected._id));
      setPosts(remaining); closeViewer();
      const key = user?._id || user?.id;
      if (key) await AsyncStorage.setItem(`profile_checkins_v5_${key}`, JSON.stringify(remaining));
    } catch {setDeleteError(label('Could not delete this post. Please try again.', 'تعذر حذف المنشور. حاول مجدداً.'));}
    finally {setDeleting(false);}
  };
  const [revision, setRevision] = useState(0);
  useStatusBar('light-content', c.background);
  useFocusEffect(useCallback(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      try {
        const [raw, token] = await Promise.all([AsyncStorage.getItem('hala_user_backend'), AsyncStorage.getItem('hala_token')]);
        const account = raw ? JSON.parse(raw) : null;
        if (!active) return;
        setUser(account);
        if (!token) throw new Error('Please sign in again.');
        const key = account?._id || account?.id;
        const cacheKey = key ? `profile_checkins_v5_${key}` : null;
        if (cacheKey) {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached && active) {setPosts(unwrap(JSON.parse(cached))); setLoading(false);}
        }
        const config = {headers: {Authorization: `Bearer ${token}`}, timeout: 15000, signal: controller.signal};
        const results = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/hbs/map/my-checkins`, config),
          axios.get(`${BASE_URL}/api/users/followers?pagination=true&limit=1`, config),
          axios.get(`${BASE_URL}/api/users/following?pagination=true&limit=1`, config),
        ]);
        if (!active) return;
        const checks = results[0];
        if (checks.status === 'fulfilled') {
          const items = unwrap(checks.value.data, 'checkins', 'posts');
          setPosts(items); setError('');
          if (cacheKey) AsyncStorage.setItem(cacheKey, JSON.stringify(items)).catch(() => {});
        } else setError(ar ? 'تعذر تحديث الزيارات. اضغط لإعادة المحاولة.' : 'Could not refresh check-ins. Tap to retry.');
        [setFollowers, setFollowing].forEach((set, i) => {
          const result = results[i + 1];
          if (result.status === 'fulfilled') {
            const data = result.value.data;
            const meta = unwrapMeta(data);
            set({value: meta.total ?? unwrap(data, i === 0 ? 'followers' : 'following', 'users').length, more: meta.total === null && meta.hasMore});
          } else set(null);
        });
      } catch {if (active) setError(ar ? 'تعذر تحميل الملف الشخصي. حاول مجدداً.' : 'Could not load your profile. Tap to retry.');}
      finally {if (active) {setLoading(false); setRefreshing(false);}}
    }
    load();
    return () => {active = false; controller.abort();};
  }, [ar, revision]));
  const places = useMemo(() => Array.from(new Map(posts.map(p => [p.location?._id || p.location?.name || p._id, p])).values()), [posts]);
  const initials = (user?.name || 'U').split(/\s+/).slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  const formatCount = (count: Count) => count ? `${count.value}${count.more ? '+' : ''}` : '—';
  const refresh = () => {setRefreshing(true); setRevision(v => v + 1);};
  const row = {flexDirection: ar ? 'row-reverse' as const : 'row' as const};
  const Header = <View style={s.header}>
    <View style={[s.identity, row]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label('Edit profile', 'تعديل الملف الشخصي')} onPress={() => navigation.navigate('EditAccount')}>
        {user?.avatar || user?.profilePhoto ? <Image source={{uri: user.avatar || user.profilePhoto}} style={s.avatar} /> : <View style={[s.avatar, s.fallback]}><Text style={s.initials}>{initials}</Text></View>}
      </Pressable>
      <View style={{flex: 1}}><Text style={[s.name, {textAlign: ar ? 'right' : 'left'}]}>{user?.name || label('Your profile', 'ملفك الشخصي')}</Text>
        <Text style={s.subtitle}>{label('Your places. Your moments.', 'أماكنك. لحظاتك.')}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={label('Settings', 'الإعدادات')} style={s.iconButton} onPress={() => navigation.navigate('Settings')}><Ionicons name="menu-outline" size={26} color={c.text} /></Pressable>
    </View>
    {!!user?.bio && <Text style={s.bio}>{user.bio}</Text>}
    <View style={[s.stats, row]}>
      {[
        {value: String(posts.length), title: label('Posts', 'المنشورات'), action: () => setTab('checkins')},
        {value: formatCount(following), title: label('Following', 'أتابع'), action: () => navigation.navigate('SocialConnections', {mode: 'following'})},
        {value: formatCount(followers), title: label('Followers', 'المتابعون'), action: () => navigation.navigate('SocialConnections', {mode: 'followers'})},
      ].map(stat => <Pressable key={stat.title} accessibilityRole="button" style={s.stat} onPress={stat.action}><Text style={s.number}>{stat.value}</Text><Text style={s.statLabel}>{stat.title}</Text></Pressable>)}
    </View>
    <View style={[s.tabs, row]}>{(['checkins', 'places'] as const).map(key => <Pressable key={key} accessibilityRole="tab" accessibilityState={{selected: tab === key}} style={[s.tab, tab === key && s.activeTab]} onPress={() => setTab(key)}><Ionicons name={key === 'checkins' ? 'grid-outline' : 'location-outline'} size={18} color={tab === key ? c.text : c.muted} /><Text style={[s.tabText, tab === key && {color: c.text}]}>{key === 'checkins' ? label('Check-ins', 'الزيارات') : label('Places', 'الأماكن')}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel={label('Add friends', 'إضافة أصدقاء')} style={s.addButton} onPress={() => navigation.navigate('StartChatScreen')}><Ionicons name="person-add-outline" size={17} color={c.text} /><Text style={s.buttonText}>{label('Add+', 'إضافة +')}</Text></Pressable></View>
    {!!error && <Pressable onPress={refresh} style={s.error}><Text style={s.muted}>{error}</Text></Pressable>}
  </View>;
  return <SafeAreaView style={s.safe} edges={route?.name === 'Profile' ? ['top'] : ['top', 'bottom']}>
    <FlatList key={tab} data={tab === 'checkins' ? posts : places} numColumns={3}
      keyExtractor={(item, i) => String(item._id || i)} ListHeaderComponent={Header}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.accent} colors={[c.accent]} />}
      contentContainerStyle={{paddingBottom: 24, flexGrow: 1}} showsVerticalScrollIndicator={false}
      renderItem={({item}) => <Pressable accessibilityRole="button" accessibilityLabel={item.location?.name || label('Open check-in', 'عرض الزيارة')} onPress={() => {setConfirmDelete(false); setDeleteError(''); setSelected(item);}} style={[s.tile, {width: width / 3 - 2, height: width / 3 - 2}]}>
        {!!item.image && <ProfilePhoto key={item.image} uri={item.image} />}
        {tab === 'places' && <View style={s.tileCaption}><Text numberOfLines={2} style={s.placeName}>{item.location?.name || label('Place', 'مكان')}</Text></View>}
      </Pressable>}
      ListEmptyComponent={<View style={s.empty}>{loading ? <ActivityIndicator size="large" /> : <><Ionicons name="camera-outline" size={38} color={c.muted} /><Text style={s.emptyTitle}>{label('Your story starts here', 'قصتك تبدأ هنا')}</Text><Text style={s.muted}>{label('Check in to a place to add your first moment.', 'سجّل زيارتك لمكان لإضافة أول لحظة.')}</Text><Pressable accessibilityRole="button" style={[s.secondary, {marginTop: 20}]} onPress={() => navigation.navigate('Timeline')}><Text style={s.buttonText}>{label('Create a check-in', 'إضافة زيارة')}</Text></Pressable></>}</View>}
    />
    {!!selected && <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={closeViewer}>
      <SafeAreaProvider><SafeAreaView style={s.safe}>
        <View style={[s.viewerHeader, {zIndex: 2, flexShrink: 0}]}>
          <Text style={[s.name, {flex: 1}]} numberOfLines={1}>{selected.location?.name || label('Check-in', 'زيارة')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={label('Close', 'إغلاق')} hitSlop={12} style={s.iconButton} onPress={closeViewer}><Ionicons name="close" size={28} color={c.text} /></Pressable>
        </View>
        <View style={{flex: 1}}>{!!selected.image && <ProfilePhoto key={selected.image} uri={selected.image} contain />}</View>
        <View style={{padding: 20, gap: 12}}>
          <Text style={{color: c.text}}>{selected.caption}</Text>
          {!!selected.createdAt && <Text style={s.muted}>{new Date(selected.createdAt).toLocaleDateString(ar ? 'ar' : 'en')}</Text>}
          {!!deleteError && <Text style={s.muted}>{deleteError}</Text>}
          {confirmDelete ? <View style={{gap: 12}}><Text style={s.muted}>{label('Delete this post? This cannot be undone.', 'حذف هذا المنشور؟ لا يمكن التراجع.')}</Text><View style={{flexDirection: 'row', gap: 12}}>
            <Pressable style={s.secondary} disabled={deleting} onPress={() => setConfirmDelete(false)}><Text style={s.buttonText}>{label('Cancel', 'إلغاء')}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Confirm delete post" style={[s.secondary, s.primary]} disabled={deleting} onPress={deletePost}>{deleting ? <ActivityIndicator /> : <Text style={s.buttonText}>{label('Delete', 'حذف')}</Text>}</Pressable>
          </View></View> : <Pressable accessibilityRole="button" accessibilityLabel="Delete post" onPress={() => setConfirmDelete(true)} style={{minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8}}><Ionicons name="trash-outline" size={20} color={c.accent} /><Text style={{color: c.accent}}>{label('Delete post', 'حذف المنشور')}</Text></Pressable>}
        </View>
      </SafeAreaView></SafeAreaProvider>
    </Modal>}

  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: c.background}, header: {paddingTop: 20}, identity: {alignItems: 'center', gap: 14, paddingHorizontal: 20},
  avatar: {width: 72, height: 72, borderRadius: 36, backgroundColor: c.raised}, fallback: {alignItems: 'center', justifyContent: 'center'}, initials: {fontSize: 25, fontWeight: '700', color: c.text},
  name: {fontSize: 22, fontWeight: '700', color: c.text}, subtitle: {fontSize: 12, lineHeight: 18, color: c.muted, marginTop: 5}, iconButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  bio: {fontSize: 15, lineHeight: 22, color: c.text, marginHorizontal: 20, marginTop: 14}, stats: {marginHorizontal: 20, marginVertical: 24}, stat: {flex: 1, alignItems: 'center', minHeight: 48}, number: {fontSize: 23, fontWeight: '700', color: c.text}, statLabel: {fontSize: 13, color: c.muted, marginTop: 5},
  actions: {gap: 10, marginHorizontal: 20, marginBottom: 24}, secondary: {flexDirection: 'row', gap: 8, flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14}, primary: {backgroundColor: c.accent}, buttonText: {color: c.text, fontSize: 14, fontWeight: '600'},
  addButton: {flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent, borderRadius: 10, minHeight: 44, paddingHorizontal: 14, marginHorizontal: 8},
  tabs: {alignItems: 'center', borderBottomColor: c.border, borderBottomWidth: 1, marginBottom: 2}, tab: {flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', minHeight: 52, borderBottomWidth: 2, borderBottomColor: 'transparent'}, activeTab: {borderBottomColor: c.accent}, tabText: {fontSize: 14, color: c.muted, fontWeight: '600'},
  tile: {margin: 1, backgroundColor: c.surface}, tileCaption: {position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: c.overlay}, placeName: {color: c.text, fontSize: 12, fontWeight: '600'},
  empty: {alignItems: 'center', padding: 32, gap: 12}, emptyTitle: {fontSize: 20, color: c.text, fontWeight: '600'}, muted: {fontSize: 14, lineHeight: 21, color: c.muted, textAlign: 'center'}, error: {padding: 14, backgroundColor: c.accentSoft}, viewerHeader: {flexDirection: 'row', alignItems: 'center', padding: 16},
});