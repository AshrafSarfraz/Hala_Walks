import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import CachedImage from '../../../../components/Media/CachedImage';
import {Text} from '../../../../components/Text';
import {fetchFlatOfferFromFirebase} from '../../../../firebase/firebaseutils';
import {RootState} from '../../../../redux/store';
import {Colors} from '../../../../theme/Colors';
import {Fonts} from '../../../../theme/Fonts';
import {SectionHeader} from '../homeUi';

const GAP = 10;
const AUTOPLAY_MS = 4500;
const MAX_DOTS = 8;

export default function ImageSlider(_props: {navigation: any}) {
  const navigation = useNavigation<any>();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {width} = useWindowDimensions();
  const [offers, setOffers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<any>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const dragging = useRef(false);

  // Next banner peeks in from the side when there is more than one.
  const single = offers.length < 2;
  const itemW = single ? width - 32 : width - 56;
  const step = itemW + GAP;
  const imageH = Math.min(200, itemW * 0.55);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('offers');
        const cache = raw ? JSON.parse(raw) : [];
        if (mounted && Array.isArray(cache)) setOffers(cache);
      } catch {}
      try {
        const fresh = await fetchFlatOfferFromFirebase();
        if (mounted && Array.isArray(fresh)) {
          setOffers(fresh);
          await AsyncStorage.setItem('offers', JSON.stringify(fresh));
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-slide; pauses while the user is swiping.
  useEffect(() => {
    if (single) return;
    const timer = setInterval(() => {
      if (dragging.current) return;
      const next = (index + 1) % offers.length;
      listRef.current?.scrollToOffset({offset: next * step, animated: true});
      setIndex(next);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, offers.length, single, step]);

  if (!offers.length) return null;

  return (
    <View style={styles.root}>
      <SectionHeader
        ar={ar}
        icon="flash-outline"
        title={ar ? 'عروض مميزة' : 'Featured Offers'}
        subtitle={ar ? 'عروض حصرية لك' : 'Exclusive offers for you'}
      />
      <Animated.FlatList
        ref={listRef as any}
        key={itemW}
        data={offers}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        keyExtractor={(o: any) => String(o.id)}
        getItemLayout={(_: any, i: number) => ({
          index: i,
          length: step,
          offset: i * step,
        })}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onMomentumScrollEnd={(e: any) => {
          dragging.current = false;
          const i = Math.round(e.nativeEvent.contentOffset.x / step);
          setIndex(Math.max(0, Math.min(offers.length - 1, i)));
        }}
        renderItem={({item}: {item: any}) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, {width: itemW, height: imageH}]}
            onPress={() => navigation.navigate('DetailScreen', {item})}>
            <CachedImage
              uri={String(item.img || '')}
              style={{width: itemW, height: imageH}}
            />
          </TouchableOpacity>
        )}
      />

      {!single && (
        <View style={styles.pager}>
          {offers.length <= MAX_DOTS && (
            <View style={styles.dots}>
              {offers.map((o, i) => {
                const range = [(i - 1) * step, i * step, (i + 1) * step];
                return (
                  <Animated.View
                    key={String(o.id)}
                    style={[
                      styles.dot,
                      {
                        width: scrollX.interpolate({
                          inputRange: range,
                          outputRange: [6, 22, 6],
                          extrapolate: 'clamp',
                        }),
                        opacity: scrollX.interpolate({
                          inputRange: range,
                          outputRange: [0.25, 1, 0.25],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1} / {offers.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {marginTop: 24},
  list: {paddingHorizontal: 16},
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.accentSoft,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  dots: {flexDirection: 'row', alignItems: 'center', gap: 5},
  dot: {height: 6, borderRadius: 3, backgroundColor: Colors.PrimaryColor},
  counter: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 11,
    fontFamily: Fonts.F_Medium,
    color: Colors.PrimaryColor,
  },
});
