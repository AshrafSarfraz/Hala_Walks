import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React,{ useCallback,useRef,useState } from 'react';
import {
FlatList,
StyleSheet,
TouchableOpacity,
View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../../config/api';
import { ActivityIndicator } from '../../ui/ActivityIndicator';
import { Alert } from '../../ui/Alert';
import { Text } from '../../ui/Text';
import { fetchCollection } from '../api/collection';
import CustomHeader from '../Component/CustomHeader/CustomHeader';
import UserAvatar from '../Component/UserAvatar';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';
import { Colors } from '../Themes/Colors';
import {
bioPreview,
canShowMessage,
openSocialChat,
SocialPerson,
} from './socialProfile';
import { useSocialRefresh } from './useSocialRefresh';

type Person = SocialPerson;
type Request = {_id: string; user: Person};
type Mode = 'friends' | 'requests';

export default function SocialConnectionsScreen({route, navigation}: any) {
  useStatusBar('dark-content', Colors.surface);
  const mode: Mode = route.params?.mode === 'requests' ? 'requests' : 'friends';
  const userId = route.params?.userId;
  const isOwn = !userId || route.params?.isOwn === true;
  const version = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<(Person | Request)[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const title = mode === 'friends' ? 'Friends' : 'Friend requests';

  const clear = useCallback(() => {
    version.current++;
    setItems([]);
    setLoading(true);
  }, []);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++version.current;
      const active = () => requestId === version.current && !signal?.aborted;
      try {
        const token = await AsyncStorage.getItem('hala_token');
        const endpoint = mode === 'requests' ? 'friend-requests' : mode;
        const rows = await fetchCollection(
          `${BASE_URL}/api/users/${endpoint}`,
          {
            params: userId && mode !== 'requests' ? {userId} : {},
            signal,
            headers: {Authorization: `Bearer ${token}`},
            timeout: 15000,
          },
          mode,
          'users',
          'requests',
        );
        if (active()) {
          setItems(rows);
          setError(null);
        }
      } catch (e: any) {
        if (active()) {
          setItems([]);
          setError(
            e.response?.status === 403
              ? 'This account is private.'
              : `Could not load ${title.toLowerCase()}. Tap to retry.`,
          );
        }
      } finally {
        if (active()) setLoading(false);
      }
    },
    [mode, title, userId],
  );
  useSocialRefresh(load, clear);

  const message = async (user: Person) => {
    if (actionId || !canShowMessage(user)) return;
    setActionId(user._id);
    try {
      await openSocialChat(navigation, user);
    } catch {
      Alert.alert(
        'Message unavailable',
        'Messaging requires an accepted friendship and both accounts to allow messages.',
      );
      await load();
    } finally {
      setActionId(null);
    }
  };

  const handleRequest = async (request: Request, approve: boolean) => {
    if (actionId) return;
    setActionId(request._id);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      if (approve) {
        await axios.post(
          `${BASE_URL}/api/users/friend-requests/${request.user._id}/approve`,
          {},
          {
            headers: {Authorization: `Bearer ${token}`},
            timeout: 10000,
          },
        );
      } else {
        await axios.delete(
          `${BASE_URL}/api/users/friend-requests/${request.user._id}`,
          {
            headers: {Authorization: `Bearer ${token}`},
            timeout: 10000,
          },
        );
      }
      await load();
    } catch {
      Alert.alert('Error', 'Could not update this request.');
    } finally {
      setActionId(null);
    }
  };

  const removeFriend = (user: Person) =>
    Alert.alert(
      'Remove friend?',
      `Remove ${user.name}? New messages will stop for both of you.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove friend',
          style: 'destructive',
          onPress: async () => {
            setActionId(user._id);
            try {
              const token = await AsyncStorage.getItem('hala_token');
              await axios.delete(`${BASE_URL}/api/users/friends/${user._id}`, {
                headers: {Authorization: `Bearer ${token}`},
                timeout: 10000,
              });
              await load();
            } catch {
              Alert.alert('Could not remove friend', 'Please try again.');
            } finally {
              setActionId(null);
            }
          },
        },
      ],
    );

  const renderItem = ({item}: {item: Person | Request}) => {
    const request = mode === 'requests' ? (item as Request) : null;
    const user = request ? request.user : (item as Person);
    return (
      <View style={s.row}>
        <TouchableOpacity
          style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}
          accessibilityRole="button"
          accessibilityLabel={`View ${user.name}'s profile`}
          onPress={() =>
            navigation.push('UserProfile', {
              participantId: user._id,
              participantName: user.name,
            })
          }>
          <UserAvatar uri={user.avatar} style={s.avatar} />
          <View style={s.info}>
            <Text style={s.name}>{user.name}</Text>
            <Text style={s.bio}>{bioPreview(user.bio)}</Text>
          </View>
        </TouchableOpacity>
        {canShowMessage(user) && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Message ${user.name}`}
            style={s.confirm}
            disabled={actionId !== null}
            onPress={() => message(user)}>
            {actionId === user._id ? (
              <ActivityIndicator />
            ) : (
              <Text style={s.confirmText}>Message</Text>
            )}
          </TouchableOpacity>
        )}
        {mode === 'friends' && isOwn && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Remove friend ${user.name}`}
            style={s.reject}
            disabled={actionId !== null}
            onPress={() => removeFriend(user)}>
            {actionId === user._id ? (
              <ActivityIndicator />
            ) : (
              <Text style={s.rejectText}>Remove</Text>
            )}
          </TouchableOpacity>
        )}
        {request && (
          <View style={s.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Decline ${user.name}'s request`}
              style={s.reject}
              onPress={() => handleRequest(request, false)}
              disabled={actionId !== null}>
              <Text style={s.rejectText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Accept ${user.name}'s request`}
              style={s.confirm}
              onPress={() => handleRequest(request, true)}
              disabled={actionId !== null}>
              {actionId === request._id ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <Text style={s.confirmText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <CustomHeader title={route.params?.profileName ? `${route.params.profileName} · ${title}` : title} onBackPress={() => navigation.goBack()} />
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          refreshing={false}
          onRefresh={() => load()}
          data={items}
          renderItem={renderItem}
          keyExtractor={(item: any) => String(item._id)}
          contentContainerStyle={items.length ? s.list : s.empty}
          ListEmptyComponent={
            <TouchableOpacity onPress={() => load()}>
              <Text style={s.emptyText}>
                {error ||
                  (mode === 'requests'
                    ? 'No pending friend requests.'
                    : `No ${title.toLowerCase()} yet.`)}
              </Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.surface},
  header: {
    height: 58,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  back: {width: 38, height: 38, justifyContent: 'center', alignItems: 'center'},
  title: {color: Colors.textPrimary, fontSize: 17, fontWeight: '800'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {backgroundColor: Colors.background, flexGrow: 1, padding: 14, gap: 10},
  empty: {
    backgroundColor: Colors.background,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {color: Colors.textPrimary, fontSize: 15},
  row: {
    minHeight: 72,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
  },
  avatar: {width: 48, height: 48, borderRadius: 24},
  fallback: {justifyContent: 'center', alignItems: 'center'},
  initial: {color: Colors.white, fontSize: 18, fontWeight: '800'},
  info: {flex: 1, marginHorizontal: 11},
  name: {color: Colors.textPrimary, fontWeight: '700', fontSize: 15},
  bio: {color: Colors.textMuted, fontSize: 12, marginTop: 3},
  actions: {flexDirection: 'row', gap: 7},
  confirm: {
    minWidth: 70,
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginHorizontal:6
  },
  confirmText: {color: Colors.white, fontSize: 12, fontWeight: '700'},
  reject: {
    minWidth: 68,
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rejectText: {color: Colors.textPrimary, fontSize: 12, fontWeight: '700'},
});
