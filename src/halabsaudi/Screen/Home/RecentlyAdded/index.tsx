import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import Geolocation from '@react-native-community/geolocation';
import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';
import DistanceFromDevice from '../../../Component/distanceCalculate/distanceCalculate';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';
import {Location} from '../../../Themes/Images';
import { Colors } from '../../../Themes/Colors';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';
const RECENT_TTL_MS = 3 * 60 * 60 * 1000;

type CacheShape = {ts: number; data: any[]};

const RecentlyAdded: React.FC<{onDataLoaded?: (hasData: boolean) => void}> = ({onDataLoaded}) => {
  const navigation = useNavigation<any>();
  const mountedRef = useRef(true);

  const reduxCountry = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [deviceCountry, setDeviceCountry] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{[k: string]: boolean}>({});
  const [userLocation, setUserLocation] = useState<{lat: number; long: number} | null>(null);

  const norm = (v: any) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const selectedCountry = reduxCountry || deviceCountry;

  const RECENT_CACHE_KEY = useMemo(() => {
    return selectedCountry
      ? `H-recent_cache_${norm(selectedCountry)}`
      : 'H-recent_cache_unknown';
  }, [selectedCountry]);

  /* ---------------- location ---------------- */
  useEffect(() => {
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          if (!mountedRef.current) return;
          setUserLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        error => console.log('❌ Location error:', error),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const already = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (already) {
            getCurrentLocation();
            return;
          }
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'We need access to your location to provide better services.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          }
        } else {
          Geolocation.requestAuthorization();
          getCurrentLocation();
        }
      } catch (e) {
        console.log('Permission error:', e);
      }
    };

    requestLocationPermission();
  }, []);

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
    const ONE_YEAR_MS = 120 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return arr
      .map(item => ({
        id: item._id || item.id,
        ...item,
        createdAtMs: new Date(item.createdAt || item.created_at || item.time).getTime(),
      }))
      .filter(item => norm(item.status) === 'active')
      .filter(item => Number.isFinite(item.createdAtMs))
      .filter(item => now - item.createdAtMs <= ONE_YEAR_MS)
      .filter(item => selectedCountry && norm(item.selectedCountry) === norm(selectedCountry))
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 7);
  };

  /* ---------------- load data ---------------- */
  const loadData = async () => {
    if (!selectedCountry) return;

    const cached = await readCache();
    const cacheFresh = cached && Date.now() - cached.ts < RECENT_TTL_MS;

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

  // ✅ Parent ko notify karo jab loading khatam ho
  useEffect(() => {
    if (!loading) {
      onDataLoaded?.(items.length > 0);
    }
  }, [items.length, loading]);

  /* ---------------- render ---------------- */
  const handleCardLoad = (id: string) => setLoadedCards(p => ({...p, [id]: true}));

  // ✅ Loading khatam ho aur data nahi to kuch render mat karo
  if (!loading && items.length === 0) return null;

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
          <Image source={{uri: item.img}} style={styles.image} resizeMode="cover" />
        )}

        <Text style={styles.cate_txt}>
          {language === 'en' ? item.nameEng : item.nameArabic}
        </Text>

        <View style={styles.Type_Cont}>
          <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
        </View>

        <View style={styles.Loc_Status_Cont}>
          <View style={styles.Loc_Cont}>
            <Image source={Location} style={styles.LocationIcon} />
            {userLocation ? (
              <DistanceFromDevice
                userLat={userLocation.lat}
                userLong={userLocation.long}
                targetLat={Number(item.latitude)}
                targetLong={Number(item.longitude)}
                kmText="km"
                mText="m"
              />
            ) : (
              <Text style={{fontSize: 10, color: Colors.btnRed}}>--</Text>
            )}
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
        />
      )}
      <DetectCountry onCountryDetect={setDeviceCountry} />
    </View>
  );
};

export default RecentlyAdded;