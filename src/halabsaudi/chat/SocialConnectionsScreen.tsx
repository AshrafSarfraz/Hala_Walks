import {useStatusBar} from '../Component/UseStatusBar/useStatusBar';
import {Text} from '../../ui/Text';
import {fetchCollection} from '../api/collection';
import {bioPreview, canShowMessage, openSocialChat, SocialPerson} from './socialProfile';
import {useSocialRefresh} from './useSocialRefresh';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {Alert} from '../../ui/Alert';
import React, {useCallback, useRef, useState} from 'react';
import {FlatList, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {getAvatarColor} from '../Themes/avatarColor';

type Person = SocialPerson;
type Request = {_id: string; user: Person};
type Mode = 'followers' | 'following' | 'requests';

export default function SocialConnectionsScreen({route, navigation}: any) {
  useStatusBar('light-content', Colors.darkgrey);
  const mode: Mode = route.params?.mode || 'followers';
  const userId = route.params?.userId;
  const isOwn = !userId || route.params?.isOwn === true;
  const version = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<(Person | Request)[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const title = mode === 'followers' ? 'Followers' : mode === 'following' ? 'Following' : 'Follow requests';

  const clear = useCallback(() => {version.current++; setItems([]); setLoading(true);}, []);
  const load = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++version.current;
    const active = () => requestId === version.current && !signal?.aborted;
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const endpoint = mode === 'requests' ? 'follow-requests' : mode;
      const rows = await fetchCollection(`${BASE_URL}/api/users/${endpoint}`, {
        params: userId && mode !== 'requests' ? {userId} : {}, signal,
        headers: {Authorization: `Bearer ${token}`}, timeout: 15000,
      }, mode, 'users', 'requests');
      if (active()) {setItems(rows); setError(null);}
    } catch (e: any) {
      if (active()) {setItems([]); setError(e.response?.status === 403 ? 'This account is private.' : `Could not load ${title.toLowerCase()}. Tap to retry.`);}
    } finally {if (active()) setLoading(false);}
  }, [mode, title, userId]);
  useSocialRefresh(load, clear);

  const message = async (user: Person) => {
    if (actionId || !canShowMessage(user)) return;
    setActionId(user._id);
    try {await openSocialChat(navigation, user);}
    catch {Alert.alert('Message unavailable', 'Messaging requires mutual following and both accounts to allow messages.'); await load();}
    finally {setActionId(null);}
  };

  const handleRequest = async (request: Request, approve: boolean) => {
    setActionId(request._id);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      if (approve) {
        await axios.post(`${BASE_URL}/api/users/follow-requests/${request.user._id}/approve`, {}, {
          headers: {Authorization: `Bearer ${token}`}, timeout: 10000,
        });
      } else {
        await axios.delete(`${BASE_URL}/api/users/follow-requests/${request.user._id}`, {
          headers: {Authorization: `Bearer ${token}`}, timeout: 10000,
        });
      }
      await load();
    } catch {
      Alert.alert('Error', 'Could not update this request.');
    } finally {
      setActionId(null);
    }
  };

  const unfollow = (user: Person) => Alert.alert('Unfollow?', `Stop following ${user.name}?`, [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Unfollow', style: 'destructive', onPress: async () => {
      setActionId(user._id);
      try {
        const token = await AsyncStorage.getItem('hala_token');
        await axios.delete(`${BASE_URL}/api/users/follow/${user._id}`, {headers: {Authorization: `Bearer ${token}`}, timeout: 10000});
        await load();
      } catch { Alert.alert('Could not unfollow', 'Please try again.'); }
      finally { setActionId(null); }
    }},
  ]);

  const renderItem = ({item}: {item: Person | Request}) => {
    const request = mode === 'requests' ? item as Request : null;
    const user = request ? request.user : item as Person;
    return (
      <View style={s.row}>
        <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} accessibilityRole="button" accessibilityLabel={`View ${user.name}'s profile`}
          onPress={() => navigation.push('UserProfile', {participantId: user._id, participantName: user.name})}>
        {user.avatar ? <Image source={{uri: user.avatar}} style={s.avatar} /> : (
          <View style={[s.avatar, s.fallback, {backgroundColor: getAvatarColor(user._id)}]}>
            <Text style={s.initial}>{(user.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={s.info}>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.bio}>{bioPreview(user.bio)}</Text>
        </View>
        </TouchableOpacity>
        {canShowMessage(user) && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Message ${user.name}`} style={s.confirm} disabled={actionId !== null} onPress={() => message(user)}>
          {actionId === user._id ? <ActivityIndicator /> : <Text style={s.confirmText}>Message</Text>}
        </TouchableOpacity>}
        {mode === 'following' && isOwn && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Unfollow ${user.name}`} style={s.reject} disabled={actionId !== null} onPress={() => unfollow(user)}>
          {actionId === user._id ? <ActivityIndicator /> : <Text style={s.rejectText}>Unfollow</Text>}
        </TouchableOpacity>}
        {request && (
          <View style={s.actions}>
            <TouchableOpacity style={s.reject} onPress={() => handleRequest(request, false)} disabled={actionId === request._id}>
              <Text style={s.rejectText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirm} onPress={() => handleRequest(request, true)} disabled={actionId === request._id}>
              {actionId === request._id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.confirmText}>Confirm</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}><Ionicons name="arrow-back" size={22} color={Colors.White} /></TouchableOpacity>
        <Text style={s.title} numberOfLines={1}>{route.params?.profileName ? `${route.params.profileName} · ${title}` : title}</Text>
        <View style={s.back} />
      </View>
      {loading ? <View style={s.center}><ActivityIndicator size="large" color={Colors.btnRed} /></View> : (
        <FlatList
          refreshing={false} onRefresh={() => load()} data={items} renderItem={renderItem} keyExtractor={(item: any) => String(item._id)}
          contentContainerStyle={items.length ? s.list : s.empty}
          ListEmptyComponent={<TouchableOpacity onPress={() => load()}><Text style={s.emptyText}>{error || (mode === 'requests' ? 'No pending follow requests.' : `No ${title.toLowerCase()} yet.`)}</Text></TouchableOpacity>}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.darkgrey}, header: {height: 58, backgroundColor: Colors.darkgrey, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14},
  back: {width: 38, height: 38, justifyContent: 'center', alignItems: 'center'}, title: {color: Colors.White, fontSize: 17, fontWeight: '800'}, center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {backgroundColor: Colors.dargBg, flexGrow: 1, padding: 14, gap: 10}, empty: {backgroundColor: Colors.dargBg, flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30}, emptyText: {color: Colors.White, fontSize: 15},
  row: {minHeight: 72, backgroundColor: Colors.darkgrey, borderRadius: 14, flexDirection: 'row', alignItems: 'center', padding: 11}, avatar: {width: 48, height: 48, borderRadius: 24}, fallback: {justifyContent: 'center', alignItems: 'center'}, initial: {color: '#fff', fontSize: 18, fontWeight: '800'},
  info: {flex: 1, marginHorizontal: 11}, name: {color: Colors.White, fontWeight: '700', fontSize: 15}, bio: {color: '#8A94A6', fontSize: 12, marginTop: 3}, actions: {flexDirection: 'row', gap: 7}, confirm: {minWidth: 72, minHeight: 34, borderRadius: 8, backgroundColor: Colors.btnRed, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8}, confirmText: {color: '#fff', fontSize: 12, fontWeight: '700'}, reject: {minWidth: 58, minHeight: 44, borderRadius: 8, backgroundColor: '#343841', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8}, rejectText: {color: Colors.White, fontSize: 12, fontWeight: '700'},
});
