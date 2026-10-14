import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import ScreenHeader from './header/ScreenHeader';
import {Text} from './Text';
import RedeemHistoryModal from './Modal/StaffModal/RedeemhistoryModal';
import {firestore} from '../firebase/firebaseconfig';
import {RootState} from '../redux/store';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
import {percentValue} from '../utils/offers';

// Screen dobara khulne par purana data foran dikhane ke liye simple in-memory cache.
// App band hone par khud clear ho jata hai.
const historyCache: Record<string, any[]> = {};

export default function HistoryScreen({storageKey}: {storageKey: string}) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const cached = historyCache[storageKey];
  const [history, setHistory] = useState<any[]>(cached || []);
  const [loading, setLoading] = useState(!cached); // cache ho to spinner nahi
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const load = useCallback(
    async (isMounted: () => boolean = () => true) => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const member = stored ? JSON.parse(stored) : null;
        if (!member?.qid) return;
        const snapshot = await firestore()
          .collection('redeem_history')
          .where('qid', '==', member.qid)
          .get();
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        historyCache[storageKey] = data;
        if (isMounted()) {
          setHistory(data);
          setError(false);
        }
      } catch {
        if (isMounted()) setError(true);
      } finally {
        if (isMounted()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [storageKey],
  );

  useEffect(() => {
    let mounted = true;
    load(() => mounted); // cache ho to background mein chupchap refresh
    return () => {
      mounted = false;
    };
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const date = (item: any) => {
    const value = item.createdAt?.toDate?.() || item.createdAt;
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString(ar ? 'ar-QA' : 'en-GB')
      : String(item.date || '—');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={ar ? 'سجل الاستبدال' : 'Redeem History'}
        onBackPress={() => navigation.goBack()}
        right={
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{history.length}</Text>
          </View>
        }
      />
      {loading ? (
        <ActivityIndicator
          color={Colors.PrimaryColor}
          style={{marginTop: 40}}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.PrimaryColor}
              colors={[Colors.PrimaryColor]}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: Math.max(insets.bottom, 16) + 20,
          }}
          ListHeaderComponent={
            <Text
              style={[styles.countLabel, {textAlign: ar ? 'right' : 'left'}]}>
              {history.length} {ar ? 'عمليات استبدال' : 'REDEMPTIONS'}
            </Text>
          }
          renderItem={({item}) => (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setSelected(item)}
              style={[styles.row, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
              <View style={styles.avatar}>
                <Text style={styles.initial}>
                  {String(item.brandName || '?')
                    .trim()
                    .slice(0, 1)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text
                  numberOfLines={2}
                  style={[styles.name, {textAlign: ar ? 'right' : 'left'}]}>
                  {item.brandName}
                </Text>
                <View
                  style={[
                    styles.dateRow,
                    {flexDirection: ar ? 'row-reverse' : 'row'},
                  ]}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={Colors.Grey}
                  />
                  <Text style={styles.date}>{date(item)}</Text>
                </View>
              </View>
              <View style={styles.end}>
                <View style={styles.discount}>
                  <Text numberOfLines={2} style={styles.discountText}>
                    {percentValue(item.discount) > 0 &&
                    !/QAR|QR|AED|SAR|ريال|درهم/i.test(
                      String(item.discountText || ''),
                    )
                      ? `-${percentValue(item.discount)}%`
                      : String(item.discountText || item.discount || '—')}
                  </Text>
                </View>
                <Ionicons
                  name={ar ? 'chevron-back' : 'chevron-forward'}
                  size={19}
                  color={Colors.Grey}
                />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error
                ? ar
                  ? 'تعذر تحميل السجل.'
                  : 'Could not load history.'
                : ar
                ? 'لا توجد عمليات استبدال حتى الآن'
                : 'No redemptions yet'}
            </Text>
          }
        />
      )}
      <RedeemHistoryModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        data={selected}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.White},
  countBadge: {
    borderRadius: 20,
    minWidth: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
  },
  countNumber: {
    fontSize: 14,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
  },
  countLabel: {fontSize: 12, fontFamily: Fonts.F_Bold, marginVertical: 14},
  row: {alignItems: 'center', gap: 12, paddingVertical: 17, minHeight: 82},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.PrimaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {fontSize: 23, fontFamily: Fonts.F_Bold, color: Colors.White},
  info: {flex: 1},
  name: {fontSize: 16, fontFamily: Fonts.F_Bold, lineHeight: 22},
  dateRow: {alignItems: 'center', gap: 5, marginTop: 7},
  date: {fontSize: 11, color: Colors.Grey},
  end: {gap: 8, alignItems: 'flex-end', maxWidth: 90},
  discount: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  discountText: {
    fontFamily: Fonts.F_Medium,
    fontSize: 11,
    color: Colors.PrimaryColor,
  },
  empty: {textAlign: 'center', marginTop: 60, color: Colors.Grey},
});
