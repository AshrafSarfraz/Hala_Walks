import {Text} from '../../../../ui/Text';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {styles} from './style';
import {RootState} from '../../../redux_toolkit/store';
import {useSelector} from 'react-redux';
import {languageData} from '../../../redux_toolkit/language/languageSlice';

const VENUES_API = 'https://hala-b-saudi.onrender.com/api/hbs/venues';

const VENUES_CACHE_KEY = 'H-venues_cache_v3';
const VENUES_TTL_MS = 3 * 60 * 60 * 1000; // 12 hours (adjust)

type CacheShape = {ts: number; data: any[]};

const Venues: React.FC = () => {
  const navigation = useNavigation<any>();

  const [showAll, setShowAll] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({});

  const mountedRef = useRef(true);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);

  const norm = (v: any) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/＆/g, '&');

  const softMatch = (a: any, b: any) => {
    const A = norm(a);
    const B = norm(b);
    if (!A || !B) return false;
    return A === B || A.includes(B) || B.includes(A);
  };

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({...prev, [id]: true}));
  };

  const readCache = async (): Promise<CacheShape | null> => {
    try {
      const raw = await AsyncStorage.getItem(VENUES_CACHE_KEY);
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
    await AsyncStorage.setItem(VENUES_CACHE_KEY, JSON.stringify(payload));
  };

  const fetchFresh = async (signal?: AbortSignal) => {
    const res = await fetch(VENUES_API, {signal});
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('Venues API failed');
    const raw = (json as any)?.data ? (json as any).data : json;
    const arr = Array.isArray(raw) ? raw : [];
    return arr;
  };

  // ✅ only update UI if list actually changed (avoid flicker)
  const makeHash = (list: any[]) => {
    const minimal = list.map(x => ({
      id: String(x.id ?? x._id ?? ''),
      venueName: String(x.venueName ?? ''),
      venueNameAr: String(x.venueNameAr ?? ''),
      img: String(x.img ?? ''),
      country: String(x.country ?? ''),
      updatedAt: String(x.time ?? x.updatedAt ?? ''), // if available
    }));
    return JSON.stringify(minimal);
  };

  const loadVenues = async () => {
    // 1) cache first (instant)
    const cached = await readCache();
    const cacheFresh =
      cached && cached.ts && Date.now() - cached.ts < VENUES_TTL_MS;

    if (cached?.data?.length && mountedRef.current) {
      const cachedNormalized = cached.data.map((it: any) => ({
        id: it._id || it.id,
        ...it,
      }));
      setVenues(cachedNormalized);
      setLoading(false);
    } else {
      // no cache => show loader once
      if (mountedRef.current) setLoading(true);
    }

    // 2) if cache fresh => silently skip fetch (no background network)
    if (cacheFresh) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    // 3) cache stale or missing => background fetch (SILENT)
    const controller = new AbortController();
    try {
      const freshArr = await fetchFresh(controller.signal);
      const fresh = freshArr.map((it: any) => ({id: it._id || it.id, ...it}));

      // save cache
      await writeCache(freshArr);

      // only update if changed
      const oldHash = cached?.data ? makeHash(cached.data) : '';
      const newHash = makeHash(fresh);

      if (!mountedRef.current) return;

      if (fresh.length > 0 && newHash !== oldHash) {
        setVenues(fresh);
      } else if (!cached?.data?.length) {
        setVenues(fresh);
      }
    } catch {
      // if network fail => keep cached silently
    } finally {
      if (mountedRef.current) setLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    mountedRef.current = true;
    loadVenues();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const filteredVenues = useMemo(() => {
    if (!countryName) return venues;
    return venues.filter(v => softMatch(v?.country, countryName));
  }, [venues, countryName]);

  const visibleItems = showAll ? filteredVenues : filteredVenues.slice(0, 8);

  const renderVenueItem = ({item, index}: {item: any; index: number}) => {
    const isLoaded = imageLoaded[String(item.id)] || false;

    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('SelectedVenue', {item})}>
        <ShimmerPlaceholder
          visible={isLoaded}
          LinearGradient={LinearGradient}
          style={styles.image}>
          <FastImage
            source={{
              uri: item.img,
              priority:
                index <= 6
                  ? FastImage.priority.high
                  : index <= 10
                  ? FastImage.priority.normal
                  : FastImage.priority.low,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
            onLoad={() => handleImageLoad(String(item.id))}
          />
        </ShimmerPlaceholder>

        <ShimmerPlaceholder
          visible={isLoaded}
          LinearGradient={LinearGradient}
          style={{width: '80%', marginTop: 2, height: 20, borderRadius: 5}}>
          <Text style={styles.cate_txt}>
            {language === 'en' ? item.venueName : item.venueNameAr}
          </Text>
        </ShimmerPlaceholder>
      </TouchableOpacity>
    );
  };

  // ✅ IMPORTANT: If you use this inside ScrollView, keep this false so page can scroll
  // Add scrollEnabled={false} when placing inside ScrollView.
  if (loading && venues.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        {/* loader only first time when no cache */}
        <Text style={{opacity: 0.6}}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <FlatList
        data={visibleItems}
        keyExtractor={item => String(item.id)}
        numColumns={4}
        renderItem={renderVenueItem}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        columnWrapperStyle={{justifyContent: 'flex-start'}} // ✅ left se start karo
      />
      {filteredVenues.length > 8 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAll(!showAll)}>
          <Text style={styles.showMoreText}>
            {showAll ? languageData[language].Hide : languageData[language].Show_More}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Venues;
