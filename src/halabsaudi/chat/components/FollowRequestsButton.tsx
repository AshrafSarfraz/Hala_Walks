import React, {useCallback, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../ui/Text';
import {BASE_URL} from '../../../config/api';
import {useSocialRefresh} from '../useSocialRefresh';

export default function FollowRequestsButton({navigation}: {navigation: any}) {
  const ar = useSelector((state: any) => state.language.language === 'ar');
  const [count, setCount] = useState<number | null>(null);
  const clear = useCallback(() => setCount(null), []);
  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const token = await AsyncStorage.getItem('hala_token');
      if (!token || signal.aborted) return;
      const {data} = await axios.get(`${BASE_URL}/api/users/follow-requests`, {
        params: {pagination: true, limit: 1}, headers: {Authorization: `Bearer ${token}`}, signal, timeout: 15000,
      });
      if (!signal.aborted) setCount(typeof data.total === 'number' ? data.total : null);
    } catch { /* Keep the requests inbox accessible even without a connection. */ }
  }, []);
  useSocialRefresh(load, clear);
  return <Pressable accessibilityRole="button" accessibilityLabel={ar ? 'طلبات المتابعة' : 'Follow requests'}
    onPress={() => navigation.navigate('SocialConnections', {mode: 'requests'})}
    style={{marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#272B33', flexDirection: ar ? 'row-reverse' : 'row', alignItems: 'center', gap: 10}}>
    <Ionicons name="person-add-outline" size={20} color="#F5F6F8" />
    <Text style={{flex: 1, color: '#F5F6F8', fontWeight: '600'}}>{ar ? 'طلبات المتابعة' : 'Follow requests'}</Text>
    {count !== null && <View style={{backgroundColor: count ? '#E75049' : '#343841', borderRadius: 12, minWidth: 24, padding: 4, alignItems: 'center'}}>
      <Text style={{color: '#fff', fontWeight: '700'}}>{count}</Text>
    </View>}
    <Ionicons name={ar ? 'chevron-back' : 'chevron-forward'} size={18} color="#F5F6F8" />
  </Pressable>;
}
