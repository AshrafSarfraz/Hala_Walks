import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import CachedImage from '../../../../components/Media/CachedImage';
import {Text} from '../../../../components/Text';
import {firestore} from '../../../../firebase/firebaseconfig';
import {RootState} from '../../../../redux/store';
import {Colors} from '../../../../theme/Colors';
import {Fonts} from '../../../../theme/Fonts';
import {eventTimestamp} from '../homeData';
import {IconName, SectionHeader, brandName} from '../homeUi';

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

let inflight: Promise<any[]> | null = null;
function loadEvents(): Promise<any[]> {
  if (!inflight)
    inflight = firestore()
      .collection('Events')
      .get()
      .then(snapshot => snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
      .finally(() => {
        inflight = null;
      });
  return inflight;
}

export default function EventSlider({
  navigation,
  refreshKey = 0,
}: {
  navigation: any;
  refreshKey?: number;
}) {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const {width} = useWindowDimensions();
  const cardWidth = width - 44;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(false);
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('events_cache');
          const cached = raw ? JSON.parse(raw) : [];
          if (active && Array.isArray(cached) && cached.length)
            setEvents(cached);
        } catch {}
        try {
          const fresh = await loadEvents();
          if (active) {
            setEvents(fresh);
            setLoading(false);
          }
          await AsyncStorage.setItem(
            'events_cache',
            JSON.stringify(fresh),
          ).catch(() => {});
        } catch {
          if (active) {
            setError(true);
            setLoading(false);
          }
        }
      })();
      return () => {
        active = false;
      };
    }, [refreshKey, retry]),
  );

  const onRetry = () => setRetry(value => value + 1);

  return (
    <View style={styles.root}>
      <SectionHeader
        ar={ar}
        icon="calendar-outline"
        title={ar ? 'الفعاليات القادمة' : 'Upcoming Events'}
        subtitle={ar ? 'ما يحدث في ويست ووك' : "What's happening at West Walk"}
        count={events.length || undefined}
      />

      {loading && !events.length ? (
        <ActivityIndicator color={Colors.PrimaryColor} style={{height: 120}} />
      ) : events.length ? (
        <>
          <FlatList
            data={events}
            horizontal
            inverted={ar}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            keyExtractor={e => String(e.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 16}}
            ItemSeparatorComponent={() => <View style={{width: 12}} />}
            snapToInterval={cardWidth + 12}
            decelerationRate="fast"
            renderItem={({item}) => (
              <EventCard
                item={item}
                ar={ar}
                width={cardWidth}
                onPress={() =>
                  navigation.navigate('DetailScreen', {item, source: 'event'})
                }
              />
            )}
          />
          {error && (
            <TouchableOpacity onPress={onRetry} style={styles.retryInline}>
              <Text style={styles.retryText}>
                {ar
                  ? 'تعذر تحديث الفعاليات. اضغط للمحاولة مرة أخرى.'
                  : 'Could not refresh events. Tap to retry.'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <EventsComingSoon ar={ar} error={error} onRetry={onRetry} />
      )}
    </View>
  );
}

function EventCard({
  item,
  ar,
  width,
  onPress,
}: {
  item: any;
  ar: boolean;
  width: number;
  onPress: () => void;
}) {
  const ts = eventTimestamp(item);
  const date = ts ? new Date(ts) : null;
  const place = ar
    ? item.locationArabic || item.location
    : item.location || item.locationArabic;

  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.card, {width}]} onPress={onPress}>
      <CachedImage uri={String(item.img || '')} style={{width, height: 200}} />

      {date && (
        <View style={[styles.dateBadge, ar ? {right: 12} : {left: 12}]}>
          <Text style={styles.dateDay}>{date.getDate()}</Text>
          <Text style={styles.dateMonth}>
            {(ar ? MONTHS_AR : MONTHS_EN)[date.getMonth()]}
          </Text>
        </View>
      )}

      <View style={styles.caption}>
        <Text
          style={[styles.name, {textAlign: ar ? 'right' : 'left'}]}
          numberOfLines={1}>
          {brandName(item, ar)}
        </Text>
        {!!place && (
          <View style={[styles.placeRow, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
            <Ionicons name="location-outline" size={12} color={Colors.White} />
            <Text style={styles.place} numberOfLines={1}>
              {place}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/** Shown when there are no events, so users know events appear here. */
function EventsComingSoon({
  ar,
  error,
  onRetry,
}: {
  ar: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const kinds: {icon: IconName; en: string; ar: string}[] = [
    {icon: 'musical-notes-outline', en: 'Live music', ar: 'موسيقى حية'},
    {icon: 'happy-outline', en: 'Family fun', ar: 'مرح عائلي'},
    {icon: 'sparkles-outline', en: 'Festivals', ar: 'مهرجانات'},
    {icon: 'gift-outline', en: 'Giveaways', ar: 'هدايا'},
  ];

  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="calendar" size={28} color={Colors.PrimaryColor} />
      </View>
      <Text style={styles.emptyTitle}>
        {ar ? 'الفعاليات قادمة قريبًا' : 'Events are coming soon'}
      </Text>
      <Text style={styles.emptyText}>
        {ar
          ? 'ستظهر هنا جميع فعاليات ويست ووك فور الإعلان عنها. تابعنا!'
          : 'All West Walk events will show up here as soon as they are announced. Stay tuned!'}
      </Text>

      <View style={[styles.kinds, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
        {kinds.map(k => (
          <View key={k.en} style={[styles.kind, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
            <Ionicons name={k.icon} size={13} color={Colors.PrimaryColor} />
            <Text style={styles.kindText}>{ar ? k.ar : k.en}</Text>
          </View>
        ))}
      </View>

      {error && (
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Ionicons name="refresh-outline" size={14} color={Colors.PrimaryColor} />
          <Text style={styles.retryText}>
            {ar ? 'تعذر التحميل. اضغط للمحاولة مرة أخرى.' : 'Could not load. Tap to retry.'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {marginTop: 24},
  card: {borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.accentSoft},
  dateBadge: {
    position: 'absolute',
    top: 12,
    width: 52,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.White,
    alignItems: 'center',
  },
  dateDay: {fontSize: 18, lineHeight: 22, fontFamily: Fonts.F_Bold, color: Colors.PrimaryColor},
  dateMonth: {fontSize: 10, fontFamily: Fonts.F_Medium, color: Colors.textSecondary},
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  name: {fontSize: 15, fontFamily: Fonts.F_Bold, color: Colors.White},
  placeRow: {alignItems: 'center', gap: 4, marginTop: 3},
  place: {fontSize: 11, color: Colors.White, flexShrink: 1},
  empty: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.White,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {fontSize: 16, fontFamily: Fonts.F_Bold, color: Colors.PrimaryColor},
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  kinds: {flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14},
  kind: {
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.White,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  kindText: {fontSize: 11, fontFamily: Fonts.F_Medium, color: Colors.PrimaryColor},
  retryBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14},
  retryInline: {paddingHorizontal: 16, paddingTop: 10},
  retryText: {fontSize: 12, color: Colors.PrimaryColor, textAlign: 'center'},
});
