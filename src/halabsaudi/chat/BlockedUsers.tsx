// src/halabsaudi/chat/BlockedUsersScreen.tsx
import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {getAvatarColor} from '../Themes/avatarColor';
import {languageData} from '../redux_toolkit/language/languageSlice';
import {RootState} from '../redux_toolkit/store';

type BlockedUser = {
  _id: string;
  blocked: {_id: string; name: string; email?: string};
};

export default function BlockedUsers({navigation}: any) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('hala_token');
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/api/block/blocked-list`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setBlockedUsers(res.data);
    } catch (err: any) {
      console.log('fetchBlockedUsers error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlockedUsers(); }, [fetchBlockedUsers]);

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert(
      t.unblock_title,
      `${user.blocked.name} ${t.unblock_confirm_msg}`,
      [
        {text: t.cancel, style: 'cancel'},
        {
          text: t.unblock,
          onPress: async () => {
            try {
              setUnblockingId(user.blocked._id);
              const token = await AsyncStorage.getItem('hala_token');
              if (!token) return;
              await axios.delete(`${BASE_URL}/api/block/${user.blocked._id}`, {
                headers: {Authorization: `Bearer ${token}`},
              });
              setBlockedUsers(prev => prev.filter(u => u.blocked._id !== user.blocked._id));
            } catch {
              Alert.alert('Error', t.error_unblock);
            } finally {
              setUnblockingId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: BlockedUser}) => {
    const name         = item.blocked?.name || 'User';
    const uid          = item.blocked?._id || '';
    const avatarColor  = getAvatarColor(uid);
    const isUnblocking = unblockingId === uid;

    return (
      <View style={[styles.row, {flexDirection: rowDir}]}>
        {/* Avatar */}
        <View style={[
          styles.avatarCircle,
          {backgroundColor: avatarColor},
          isRTL ? {marginLeft: 14, marginRight: 0} : {marginRight: 14},
        ]}>
          <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        {/* Name + badge */}
        <View style={[styles.info, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
          <Text style={[styles.name, {textAlign: isRTL ? 'right' : 'left'}]}>{name}</Text>
          <View style={[styles.blockedPill, {flexDirection: rowDir}]}>
            <Ionicons name="ban" size={10} color={Colors.Red} />
            <Text style={styles.blockedPillText}>{t.blocked_label}</Text>
          </View>
        </View>

        {/* Unblock chip */}
        <TouchableOpacity
          style={[styles.unblockChip, {flexDirection: rowDir}, isUnblocking && {opacity: 0.55}]}
          onPress={() => handleUnblock(item)}
          disabled={isUnblocking}
          activeOpacity={0.75}>
          {isUnblocking ? (
            <ActivityIndicator size="small" color={Colors.Red} />
          ) : (
            <>
              <Ionicons name="lock-open-outline" size={14} color={Colors.Red} />
              <Text style={styles.unblockChipText}>{t.unblock}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyRing}>
        <Ionicons name="shield-checkmark-outline" size={42} color={Colors.Green} />
      </View>
      <Text style={styles.emptyTitle}>{t.no_blocked_users}</Text>
      <Text style={[styles.emptySub, {textAlign: 'center'}]}>{t.no_blocked_desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.Green} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={[styles.headerRow, {flexDirection: rowDir}]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}>
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={20}
              color={Colors.White}
            />
          </TouchableOpacity>

          <View style={[styles.headerText, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
            <Text style={[styles.eyebrow, {textAlign: isRTL ? 'right' : 'left'}]}>
              {t.account_settings}
            </Text>
            <Text style={[styles.headerTitle, {textAlign: isRTL ? 'right' : 'left'}]}>
              {t.blocked_users_title}
            </Text>
          </View>

          {!loading && blockedUsers.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{blockedUsers.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.Green} />
            <Text style={styles.loaderText}>{t.loading_text}</Text>
          </View>
        ) : (
          <FlatList
            data={blockedUsers}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              blockedUsers.length === 0 && {flex: 1},
            ]}
            ItemSeparatorComponent={() => <View style={{height: 8}} />}
            ListHeaderComponent={
              blockedUsers.length > 0 ? (
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderText, {textAlign: isRTL ? 'right' : 'left'}]}>
                    {blockedUsers.length}{' '}
                    {blockedUsers.length > 1 ? t.users_label : t.user_label}{' '}
                    {t.blocked_count_label}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.dargBg},
  body: {flex: 1, backgroundColor: Colors.dargBg},
  header: {
    backgroundColor: Colors.dargBg,
    paddingTop: Platform.OS === 'ios' ? 4 : 10,
    paddingBottom: 20, paddingHorizontal: 18, overflow: 'hidden',
  },
  headerRow: {alignItems: 'center', gap: 12},
  backBtn: {
    width: 30, height: 30, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0,
  },
  headerText: {flex: 1},
  eyebrow: {fontSize: 10, color: Colors.White, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 3},
  headerTitle: {fontSize: 18, fontWeight: '700', color: Colors.White, letterSpacing: -0.3},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  countBadgeText: {color: Colors.White, fontSize: 13, fontWeight: '700'},
  listContent: {paddingHorizontal: 14, paddingTop: 12, paddingBottom: 36},
  listHeader: {paddingHorizontal: 4, paddingBottom: 8},
  listHeaderText: {fontSize: 11, fontWeight: '700', color: Colors.Black, letterSpacing: 0.5, textTransform: 'uppercase'},
  row: {
    alignItems: 'center', backgroundColor: Colors.White,
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14,
    shadowColor: '#1A202C', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05, shadowRadius: 8,
  },
  avatarCircle: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  avatarLetter: {color: Colors.White, fontWeight: '800', fontSize: 19},
  info: {flex: 1},
  name: {fontSize: 15, fontWeight: '700', color: Colors.Black2, marginBottom: 5},
  blockedPill: {
    alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: '#FFF0F0', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFCDD2',
  },
  blockedPillText: {fontSize: 10, color: Colors.Red, fontWeight: '700'},
  unblockChip: {
    alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: '#FFCDD2', borderRadius: 20,
    paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#FFF5F5',
    minWidth: 88, justifyContent: 'center',
  },
  unblockChipText: {fontSize: 12, color: Colors.Red, fontWeight: '700'},
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingBottom: 60, paddingHorizontal: 40, gap: 10,
  },
  emptyRing: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#E6F2EC',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    borderWidth: 3, borderColor: Colors.LightGreen,
  },
  emptyTitle: {fontSize: 18, fontWeight: '700', color: Colors.Black2},
  emptySub: {fontSize: 13, color: Colors.Grey9, lineHeight: 20},
  loaderWrap: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12},
  loaderText: {fontSize: 14, color: Colors.Grey9, marginTop: 4},
});














