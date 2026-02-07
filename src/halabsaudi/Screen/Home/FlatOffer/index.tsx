import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('screen');

const OFFERS_CACHE_KEY = 'H-Offer_cache_v2';
const OFFERS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours (adjust)

type CacheShape = {ts: number; data: any[]};

const ImageSlider: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const norm = (v: any) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const softMatch = (a: any, b: any) => {
    const A = norm(a);
    const B = norm(b);
    if (!A || !B) return false;
    return A === B || A.includes(B) || B.includes(A);
  };

  // ✅ ONLY: heroImage first, otherwise img
  const getHeroImage = (item: any) => {
    const hero = String(item?.heroImage || '').trim();
    if (hero) return hero;
    const logo = String(item?.img || '').trim();
    return logo;
  };

  const readCache = async (): Promise<CacheShape | null> => {
    try {
      const raw = await AsyncStorage.getItem(OFFERS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.data || !Array.isArray(parsed.data)) return null;
      return {ts: parsed.ts ?? 0, data: parsed.data};
    } catch {
      return null;
    }
  };

  const writeCache = async (data: any[]) => {
    const payload: CacheShape = {ts: Date.now(), data};
    await AsyncStorage.setItem(OFFERS_CACHE_KEY, JSON.stringify(payload));
  };

  const normalizeFlatOffers = (arr: any[]) => {
    return arr
      .map((item: any) => ({id: item._id || item.id, ...item}))
      .filter((item: any) => item?.isFlatOffer === true)
      .filter((item: any) => norm(item?.status || 'active') === 'active'); // safe
  };

  // ✅ stable hash so we only update UI if truly changed
  const makeHash = (list: any[]) => {
    // Only include fields that matter for slider display/order
    const minimal = list.map(x => ({
      id: String(x.id),
      heroImage: String(x.heroImage || ''),
      img: String(x.img || ''),
      selectedCountry: String(x.selectedCountry || ''),
      time: String(x.time || ''), // if your backend changes time on update, good signal
    }));
    return JSON.stringify(minimal);
  };

  const fetchBrands = async (signal?: AbortSignal) => {
    const res = await fetch('https://hala-b-saudi.onrender.com/api/hbs/brands', {signal});
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('Brands API failed');
    const raw = (json as any)?.data ? (json as any).data : json;
    return Array.isArray(raw) ? raw : [];
  };

  const loadOffers = async (opts?: {force?: boolean}) => {
    const force = opts?.force === true;

    // 1) cache first
    const cached = await readCache();
    const cacheFresh =
      cached && cached.ts && Date.now() - cached.ts < OFFERS_TTL_MS;

    if (cached?.data?.length && mountedRef.current) {
      setOffers(cached.data);
      setLoading(false);
    }

    // 2) If cache fresh and not force => don't fetch (no bar bar load)
    if (!force && cacheFresh) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    // 3) Background fetch (revalidate)
    const controller = new AbortController();
    try {
      const raw = await fetchBrands(controller.signal);
      const flatOffers = normalizeFlatOffers(raw);

      // compare with cached; update only if different
      const newHash = makeHash(flatOffers);
      const oldHash = cached?.data ? makeHash(cached.data) : '';

      await writeCache(flatOffers);

      if (!mountedRef.current) return;

      // ✅ If changed, update UI. If not changed, keep old (no flicker).
      if (newHash !== oldHash) {
        setOffers(flatOffers);
      } else if (!cached?.data?.length) {
        setOffers(flatOffers);
      }
    } catch (e) {
      // keep cached if fetch failed
    } finally {
      if (mountedRef.current) setLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    loadOffers({force: false});
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  // country filter (soft match)
  const visibleOffers = useMemo(() => {
    if (!countryName) return offers;
    return offers.filter((item: any) => softMatch(item?.selectedCountry, countryName));
  }, [offers, countryName]);

  // keep dots safe
  useEffect(() => {
    if (currentIndex >= visibleOffers.length) setCurrentIndex(0);
  }, [visibleOffers.length]);

  if (loading && offers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{height: styles.image?.height ?? 160, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="small" color="gray" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleOffers}
        keyExtractor={item => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => navigation.navigate('DetailScreen', {item})}>
            <FastImage
              source={{uri: getHeroImage(item), priority: FastImage.priority.high}}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        )}
      />

      <View style={styles.pagination}>
        {visibleOffers.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? '#005029' : '#A2A2A2',
                width: index === currentIndex ? 30 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageSlider;
