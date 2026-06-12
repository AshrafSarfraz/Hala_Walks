

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Search} from '../../Themes/Images';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import {getStyles} from './style';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {Colors} from '../../Themes/Colors';
// import DetectCountry from '../../Component/distanceCalculate/DetectCountry';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

// ✅ cache keys + TTL (change if you want)
const BRANDS_CACHE_KEY = 'H-brands_cache_v2';
const BRANDS_CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 6 hours

type CacheShape = {
  ts: number;
  data: any[];
};

const SelectedVenues: React.FC<{route: any}> = ({route}) => {
  const navigation = useNavigation<any>();
  useStatusBar('dark-content', Colors.White4, true);
  const {item} = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState<string | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const mountedRef = useRef(true);

  const norm = (v: any) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/＆/g, '&');

  // ✅ soft match so "The Village - Bahrain" matches "The Village"
  const softMatch = (a: any, b: any) => {
    const A = norm(a);
    const B = norm(b);
    if (!A || !B) return false;
    return A === B || A.includes(B) || B.includes(A);
  };

  const venueNameNorm = useMemo(() => norm(item?.venueName), [item?.venueName]);

  const filterByVenueAndActive = (arr: any[]) => {
    return arr
      .map((b: any) => ({id: b._id || b.id, ...b}))
      .filter((b: any) => norm(b?.status) === 'active') // ✅ FIX
      .filter((b: any) => softMatch(b?.selectedVenue, venueNameNorm));
  };

  const readCache = async (): Promise<CacheShape | null> => {
    try {
      const raw = await AsyncStorage.getItem(BRANDS_CACHE_KEY);
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
    await AsyncStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(payload));
  };

  const fetchFresh = async (signal?: AbortSignal) => {
    const res = await fetch(BRANDS_API, {signal});
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('Brands API failed');
    const raw = (json as any)?.data ? (json as any).data : json;
    const arr = Array.isArray(raw) ? raw : [];
    return arr;
  };

  const loadData = async (opts?: {force?: boolean}) => {
    const force = opts?.force === true;

    // 1) cache first (instant)
    const cached = await readCache();
    const cacheFresh =
      cached && cached.ts && Date.now() - cached.ts < BRANDS_CACHE_TTL_MS;

    if (cached?.data?.length) {
      const matchedCached = filterByVenueAndActive(cached.data);
      if (mountedRef.current) {
        setItems(matchedCached);
        setLoading(false);
      }
    }

    // 2) if cache is fresh and not force, skip network (no background updates)
    if (!force && cacheFresh) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    // 3) fetch once (fresh)
    const controller = new AbortController();
    try {
      const freshArr = await fetchFresh(controller.signal);
      await writeCache(freshArr);

      const matchedFresh = filterByVenueAndActive(freshArr);

      // ✅ IMPORTANT: fresh empty aaya to cached ko wipe NAHI karna
      if (mountedRef.current) {
        if (matchedFresh.length > 0) {
          setItems(matchedFresh);
        } else if (!cached?.data?.length) {
          setItems([]);
        }
      }
    } catch (e) {
      // network failed => keep cached
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }

    return () => controller.abort();
  };

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    loadData({force: false});
    return () => {
      mountedRef.current = false;
    };
    // ✅ only when venue changes
  }, [venueNameNorm]);

  // ✅ Search in already matched venue items
  const searchFiltered = useMemo(() => {
    const q = norm(searchQuery);
    if (!q) return items;

    return items.filter(entry => {
      const en = norm(entry?.nameEng);
      const ar = norm(entry?.nameArabic);
      return en.includes(q) || ar.includes(q);
    });
  }, [items, searchQuery]);

  // ✅ Country filter but NEVER blank out venue list
  const dataToShow = useMemo(() => {
    if (!country) return searchFiltered;

    const cf = searchFiltered.filter(b => softMatch(b?.selectedCountry, country));

    // fallback (avoid blank screen)
    return cf.length === 0 ? searchFiltered : cf;
  }, [searchFiltered, country]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData({force: true}); // manual refresh only
  };

  const renderRow = ({item: rowItem}: {item: any}) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('DetailScreen', {item: rowItem})}>
        <FastImage
          source={{uri: rowItem.img, priority: FastImage.priority.normal}}
          style={styles.itemImage}
          resizeMode={FastImage.resizeMode.contain}
        />

        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>
            {language === 'en' ? rowItem.nameEng : rowItem.nameArabic}
          </Text>

          <Text style={styles.itemLocation}>
            {language === 'en'
              ? rowItem.descriptionEng?.length > 70
                ? rowItem.descriptionEng.substring(0, 70) + '...'
                : rowItem.descriptionEng
              : rowItem.descriptionArabic?.length > 70
              ? rowItem.descriptionArabic.substring(0, 70) + '...'
              : rowItem.descriptionArabic}
          </Text>

          <Text style={styles.itemCity}>{rowItem.selectedCity}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <CustomHeader title={item?.venueName} onBackPress={() => navigation.goBack()} />

        <View style={{marginTop: '7%'}} />

        <View style={styles.searchContainer}>
          <Image source={Search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            placeholderTextColor={Colors.Grey9}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.FlatlistContainer}>
          {loading ? (
            <View style={{paddingTop: 20, alignItems: 'center'}}>
              <ActivityIndicator size="small" color="gray" />
            </View>
          ) : dataToShow.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={require('../../assets/Images/no_data.png')}
                style={styles.emptyStateImage}
              />
              <Text style={styles.emptyStateText}>
                {languageData[language].No_Items_Found}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>

              <FlatList
                data={dataToShow}
                keyExtractor={it => String(it.id)}
                contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
                showsVerticalScrollIndicator={false}
                renderItem={renderRow}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            </>
          )}
        </View>
      </SafeAreaView>

      {/* keep if you want, it won't blank data now */}
      {/* <DetectCountry onCountryDetect={value => setCountry(value)} /> */}
    </View>
  );
};

export default SelectedVenues;
