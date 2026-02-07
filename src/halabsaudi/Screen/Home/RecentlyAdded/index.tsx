import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';
import DistanceFromDevice from '../../../Component/distanceCalculate/distanceCalculate';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';
import {Location} from '../../../Themes/Images';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';
const RECENT_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours cache

type CacheShape = {
  ts: number;
  data: any[];
};

const RecentlyAdded: React.FC = () => {
  const navigation = useNavigation<any>();
  const mountedRef = useRef(true);

  const reduxCountry = useSelector(
    (s: RootState) => s.country?.countryName ?? null,
  );
  const language = useSelector(
    (state: RootState) => state.language.language,
  );
  const styles = getStyles(language);

  const [deviceCountry, setDeviceCountry] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{[k: string]: boolean}>({});

  /* ---------------- helpers ---------------- */

  const norm = (v: any) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const selectedCountry = reduxCountry || deviceCountry;

  const RECENT_CACHE_KEY = useMemo(() => {
    return selectedCountry
      ? `H-recent_cache_${norm(selectedCountry)}`
      : 'H-recent_cache_unknown';
  }, [selectedCountry]);

  /* ---------------- cache helpers ---------------- */

  const readCache = async (): Promise<CacheShape | null> => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.data || !Array.isArray(parsed.data)) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeCache = async (data: any[]) => {
    const payload: CacheShape = {ts: Date.now(), data};
    await AsyncStorage.setItem(RECENT_CACHE_KEY, JSON.stringify(payload));
  };

  /* ---------------- fetch ---------------- */

  const fetchBrands = async (signal?: AbortSignal) => {
    const res = await fetch(BRANDS_API, {signal});
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('Brands API failed');
    const raw = (json as any)?.data ? (json as any).data : json;
    return Array.isArray(raw) ? raw : [];
  };

  /* ---------------- recently added logic ---------------- */

  const buildRecentList = (arr: any[]) => {
    const TEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return arr
      .map(item => ({
        id: item._id || item.id,
        ...item,
        createdAtMs: new Date(
          item.createdAt || item.created_at || item.time,
        ).getTime(),
      }))
      .filter(item => norm(item.status) === 'active')
      .filter(item => Number.isFinite(item.createdAtMs))
      .filter(item => now - item.createdAtMs <= TEN_DAYS_MS) // ✅ 10 days
      .filter(
        item =>
          selectedCountry &&
          norm(item.selectedCountry) === norm(selectedCountry),
      ) // ✅ country strict
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 7);
  };

  /* ---------------- load data ---------------- */

  const loadData = async () => {
    if (!selectedCountry) return;

    const cached = await readCache();
    const cacheFresh =
      cached && Date.now() - cached.ts < RECENT_TTL_MS;

    // show cache instantly
    if (cached?.data?.length && mountedRef.current) {
      setItems(cached.data);
      setLoading(false);
    }

    if (cacheFresh) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    try {
      const raw = await fetchBrands(controller.signal);
      const recent = buildRecentList(raw);

      if (!mountedRef.current) return;

      setItems(recent);
      await writeCache(recent);
    } catch (e) {
      // keep cache silently
    } finally {
      if (mountedRef.current) setLoading(false);
    }

    return () => controller.abort();
  };

  /* ---------------- effects ---------------- */

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [selectedCountry]);

  /* ---------------- render ---------------- */

  const handleCardLoad = (id: string) =>
    setLoadedCards(p => ({...p, [id]: true}));

  const renderItem = ({item, index}: {item: any; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('DetailScreen', {item})}>
        {Platform.OS === 'ios' ? (
          <FastImage
            source={{uri: item.img}}
            style={styles.image}
            onLoadEnd={() => handleCardLoad(String(item.id))}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Image
            source={{uri: item.img}}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text style={styles.cate_txt}>
          {language === 'en'
            ? item.nameEng
            : item.nameArabic}
        </Text>

        <View style={styles.Type_Cont}>
          <Text style={styles.Type_Text}>
            {item.selectedCategory}
          </Text>
        </View>

        <View style={styles.Loc_Status_Cont}>
          <View style={styles.Loc_Cont}>
            <Image source={Location} style={styles.LocationIcon} />
            <DistanceFromDevice
              targetLat={Number(item.latitude)}
              targetLong={Number(item.longitude)}
              kmText="km away"
              mText="m away"
              loadingText="Calculating..."
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {minHeight: 140}]}>
      {loading && items.length === 0 ? (
        <ActivityIndicator size="small" color="gray" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{opacity: 0.6}}>No Recently Added</Text>
          }
        />
      )}

      <DetectCountry onCountryDetect={setDeviceCountry} />
    </View>
  );
};

export default RecentlyAdded;
