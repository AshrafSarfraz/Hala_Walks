import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {getAvatarColor} from '../Themes/avatarColor';

type Person = {_id: string; name: string; avatar?: string | null; bio?: string | null};
type Request = {_id: string; user: Person};
type Mode = 'followers' | 'following' | 'requests';

export default function SocialConnectionsScreen({route, navigation}: any) {
  const mode: Mode = route.params?.mode || 'followers';
  const [items, setItems] = useState<(Person | Request)[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const title = mode === 'followers' ? 'Followers' : mode === 'following' ? 'Following' : 'Follow requests';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const endpoint = mode === 'followers' ? 'followers' : mode === 'following' ? 'following' : 'follow-requests';
      const res = await axios.get(`${BASE_URL}/api/users/${endpoint}`, {
        headers: {Authorization: `Bearer ${token}`}, timeout: 15000,
      });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert('Error', `Could not load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [mode, title]);

  useEffect(() => { load(); }, [load]);

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
      setItems(prev => prev.filter(item => (item as Request)._id !== request._id));
    } catch {
      Alert.alert('Error', 'Could not update this request.');
    } finally {
      setActionId(null);
    }
  };

  const renderItem = ({item}: {item: Person | Request}) => {
    const request = mode === 'requests' ? item as Request : null;
    const user = request ? request.user : item as Person;
    return (
      <View style={s.row}>
        {user.avatar ? <Image source={{uri: user.avatar}} style={s.avatar} /> : (
          <View style={[s.avatar, s.fallback, {backgroundColor: getAvatarColor(user._id)}]}>
            <Text style={s.initial}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={s.info}>
          <Text style={s.name}>{user.name}</Text>
          {!!user.bio && <Text style={s.bio} numberOfLines={1}>{user.bio}</Text>}
        </View>
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
        <Text style={s.title}>{title}</Text>
        <View style={s.back} />
      </View>
      {loading ? <View style={s.center}><ActivityIndicator size="large" color={Colors.btnRed} /></View> : (
        <FlatList
          data={items} renderItem={renderItem} keyExtractor={(item: any) => String(item._id)}
          contentContainerStyle={items.length ? s.list : s.empty}
          ListEmptyComponent={<Text style={s.emptyText}>{mode === 'requests' ? 'No pending follow requests.' : `No ${title.toLowerCase()} yet.`}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F7F8FA'}, header: {height: 58, backgroundColor: Colors.darkgrey, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14},
  back: {width: 38, height: 38, justifyContent: 'center', alignItems: 'center'}, title: {color: Colors.White, fontSize: 17, fontWeight: '800'}, center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {padding: 14, gap: 10}, empty: {flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30}, emptyText: {color: '#6B7280', fontSize: 15},
  row: {minHeight: 72, backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', alignItems: 'center', padding: 11}, avatar: {width: 48, height: 48, borderRadius: 24}, fallback: {justifyContent: 'center', alignItems: 'center'}, initial: {color: '#fff', fontSize: 18, fontWeight: '800'},
  info: {flex: 1, marginHorizontal: 11}, name: {color: '#172033', fontWeight: '700', fontSize: 15}, bio: {color: '#8A94A6', fontSize: 12, marginTop: 3}, actions: {flexDirection: 'row', gap: 7}, confirm: {minWidth: 72, minHeight: 34, borderRadius: 8, backgroundColor: Colors.btnRed, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8}, confirmText: {color: '#fff', fontSize: 12, fontWeight: '700'}, reject: {minWidth: 58, minHeight: 34, borderRadius: 8, backgroundColor: '#EEF0F3', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8}, rejectText: {color: '#4B5563', fontSize: 12, fontWeight: '700'},
});
