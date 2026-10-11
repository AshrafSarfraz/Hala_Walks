import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { useSelector } from 'react-redux';
import { Text } from '../../../../ui/Text';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { RootState } from '../../../redux_toolkit/store';
import { COL_GAP, styles } from './style';

const VENUES_API = 'https://hala-b-saudi.onrender.com/api/hbs/venues';
const VENUES_CACHE_KEY = 'H-venues_cache_v3';
const VENUES_TTL_MS = 3 * 60 * 60 * 1000; // 3 ghante

type CacheShape = {ts: number; data: any[]};

const norm = (v: any) =>
  String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/＆/g, '&');

const softMatch = (a: any, b: any) => {
  const A = norm(a);
  const B = norm(b);
  if (!A || !B) return false;
  return A === B || A.includes(B) || B.includes(A);
};

const withId = (arr: any[]) => arr.map((it: any) => ({...it, id: String(it._id || it.id)}));

const Venues: React.FC = () => {
  const navigation = useNavigation<any>();

  const [showAll, setShowAll] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({});

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const isEn = language === 'en';

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    (async () => {
      // 1) Cache foran
      let cached: CacheShape | null = null;
      try {
        const raw = await AsyncStorage.getItem(VENUES_CACHE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed?.data)) cached = {ts: parsed.ts ?? 0, data: parsed.data};
      } catch {}

      if (cached?.data.length && alive) {
        setVenues(withId(cached.data));
        setLoading(false);
      }

      // 2) Cache fresh hai to API call nahi (bar bar load nahi)
      if (cached?.ts && Date.now() - cached.ts < VENUES_TTL_MS) {
        if (alive) setLoading(false);
        return;
      }

      // 3) Background mein fresh data
      try {
        const res = await fetch(VENUES_API, {signal: controller.signal});
        const json: any = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error('Venues API failed');
        const raw = json?.data ?? json;
        const arr = Array.isArray(raw) ? raw : [];
        AsyncStorage.setItem(VENUES_CACHE_KEY, JSON.stringify({ts: Date.now(), data: arr})).catch(() => {});

        if (alive && JSON.stringify(arr) !== JSON.stringify(cached?.data ?? [])) {
          setVenues(withId(arr));
        }
      } catch {
        // network fail: cache dikhta rahe
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  const filteredVenues = useMemo(() => {
    if (!countryName) return venues;
    return venues.filter(v => softMatch(v?.country, countryName));
  }, [venues, countryName]);

  const visibleItems = showAll ? filteredVenues : filteredVenues.slice(0, 8);

  const renderVenueItem = ({item, index}: {item: any; index: number}) => {
    const isLoaded = imageLoaded[item.id] || false;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.item}
        onPress={() => navigation.navigate('SelectedVenue', {item})}>
        <View style={styles.imageWrap}>
          <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={styles.image}>
            <FastImage
              source={{
                uri: item.img,
                priority: index <= 7 ? FastImage.priority.high : FastImage.priority.normal,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() => setImageLoaded(p => ({...p, [item.id]: true}))}
            />
          </ShimmerPlaceholder>
        </View>
        <Text style={[styles.cate_txt, !isEn && styles.cate_txt_ar]} numberOfLines={2}>
          {isEn ? item.venueName : item.venueNameAr}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && venues.length === 0) {
    return (
      <View style={[styles.container, styles.loaderRow]}>
        {[0, 1, 2, 3].map(i => (
          <ShimmerPlaceholder key={i} LinearGradient={LinearGradient} style={styles.shimmerItem} />
        ))}
      </View>
    );
  }

  if (!filteredVenues.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        key={isEn ? 'ltr' : 'rtl'}
        data={visibleItems}
        keyExtractor={item => item.id}
        numColumns={4}
        renderItem={renderVenueItem}
        scrollEnabled={false}
        columnWrapperStyle={{
          gap: COL_GAP,
          flexDirection: isEn ? 'row' : 'row-reverse',
        }}
      />
      {filteredVenues.length > 8 && (
        <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAll(!showAll)}>
          <Text style={styles.showMoreText}>
            {showAll ? languageData[language].Hide : languageData[language].Show_More}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Venues;
