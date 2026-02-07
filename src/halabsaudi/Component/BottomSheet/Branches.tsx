// src/components/Branches/Branches.tsx
import React, {forwardRef, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';
import {RootState} from '../../redux_toolkit/store';
import {languageData} from '../../redux_toolkit/language/languageSlice';

type Brand = {
  id: string; // mapped from _id
  _id?: any;
  nameEng?: string;
  nameArabic?: string;
  brandName?: string;
  brandId?: string;
  address?: string;
  img?: string;
  selectedVenue?: string;
  selectedCountry?: string;
  descriptionEng?: string;
  descriptionArabic?: string;
  status?: string;
};

type Props = {
  brandName?: string; // filter target brand name
  excludeId?: string; // exclude current branch id
  onSelect?: (item: Brand) => void;
  height?: number;
};

// Basic type for RBSheet imperative API
type RBSheetRef = {open: () => void; close: () => void};

// ✅ Your Node.js API
const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';
const CACHE_KEY = 'H-brands_cache';

const Branches = forwardRef<RBSheetRef, Props>(
  ({brandName, excludeId, onSelect, height = 450}, ref) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

    const language = useSelector((s: RootState) => s.language.language);
    const countryName = useSelector(
      (s: RootState) => s.country?.countryName ?? null,
    );

    const nav = useNavigation<any>();
    const styles = getStyles(language);

    const norm = (s?: any) => String(s ?? '').trim().toLowerCase();

    /* ================= LOAD BRANDS FROM NODE API ================= */
    useEffect(() => {
      const loadBrands = async () => {
        try {
          // 1) Show cached data immediately
          const cachedData = await AsyncStorage.getItem(CACHE_KEY);
          if (cachedData) {
            setBrands(JSON.parse(cachedData));
            setLoading(false);
          }

          // 2) Fetch fresh data from API
          const res = await fetch(BRANDS_API);
          const json = await res.json();

          // API may return {data: []} or []
          const arr =
            Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];

          // 3) Map Mongo _id -> id (string)
          const mapped: Brand[] = arr.map((b: any) => ({
            ...b,
            id: String(b?.id ?? b?._id?.$oid ?? b?._id ?? b?.brandId ?? ''),
          }));

          // 4) Save + update
          setBrands(mapped);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          setLoading(false);
        } catch (error) {
          console.error('Error loading brands:', error);
          setLoading(false);
        }
      };

      loadBrands();
    }, []);

    // ================= FILTERING =================
    const filtered = useMemo(() => {
      let list = brands;

      // ✅ only Active brands (API has "Active")
      list = list.filter(b => norm(b.status) === 'active');

      // Filter by brand name
      if (brandName) {
        const key = norm(brandName);
        list = list.filter(
          b =>
            norm(b.nameEng) === key ||
            norm(b.nameArabic) === key ||
            norm(b.brandName) === key,
        );
      }

      // Filter by selected country (from redux)
      if (countryName) {
        const c = norm(countryName);
        list = list.filter(b => norm(b.selectedCountry) === c);
      }

      // Exclude current branch id
      if (excludeId) {
        list = list.filter(b => String(b.id) !== String(excludeId));
      }

      return list;
    }, [brands, brandName, countryName, excludeId]);

    const handleImageLoad = (id: string) =>
      setImageLoaded(prev => ({...prev, [id]: true}));

    const handlePress = (item: Brand) => {
      // Close the sheet first
      (ref as React.RefObject<RBSheetRef>)?.current?.close?.();

      // Then act
      if (onSelect) {
        onSelect(item);
      } else {
        setTimeout(() => nav.navigate('DetailScreen', {item}), 150);
      }
    };

    const renderSkeleton = () => (
      <FlatList
        data={[1, 2, 3, 4, 5, 6]}
        keyExtractor={i => String(i)}
        renderItem={() => (
          <View style={styles.itemContainer}>
            <ShimmerPlaceholder
              visible={false}
              LinearGradient={LinearGradient}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <ShimmerPlaceholder
                visible={false}
                LinearGradient={LinearGradient}
                style={{height: 20, marginBottom: 6}}
              />
              <ShimmerPlaceholder
                visible={false}
                LinearGradient={LinearGradient}
                style={{height: 15, marginBottom: 6}}
              />
              <ShimmerPlaceholder
                visible={false}
                LinearGradient={LinearGradient}
                style={{height: 15, width: 80}}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );

    const renderItem = ({item, index}: {item: Brand; index: number}) => {
      const isLoaded = imageLoaded[item.id] || false;
      const title = language === 'ar' ? item.nameArabic : item.nameEng;
      const descFull =
        language === 'ar' ? item.descriptionArabic : item.descriptionEng;
      const desc =
        (descFull || '').length > 70
          ? `${descFull?.substring(0, 70)}...`
          : descFull || '';

      return (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => handlePress(item)}>
          <ShimmerPlaceholder
            visible={isLoaded}
            LinearGradient={LinearGradient}
            style={styles.itemImage}>
            {item.img ? (
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
                style={styles.itemImage}
                onLoad={() => handleImageLoad(item.id)}
              />
            ) : (
              <View style={[styles.itemImage, styles.imgPlaceholder]} />
            )}
          </ShimmerPlaceholder>

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {title || '—'}
            </Text>

            {!!desc && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {desc}
              </Text>
            )}

            {!!item.address && (
              <Text style={styles.itemVenue} numberOfLines={1}>
                {item.address}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <RBSheet
        ref={ref as any}
        closeOnDragDown
        closeOnPressMask
        height={height}
        customStyles={{
          wrapper: {backgroundColor: 'rgba(0, 0, 0, 0.3)'},
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#f9f9f9',
            elevation: 10,
          },
          draggableIcon: {backgroundColor: '#bbb'},
        }}>
        <View style={styles.container}>
          <Text style={styles.sheetTitle}>
            {language === 'ar'
              ? brandName
                ? `فروع ${brandName}`
                : 'الفروع'
              : brandName
              ? `Branches of ${brandName}`
              : 'Branches'}
          </Text>

          {loading ? (
            renderSkeleton()
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>
              {languageData[language].No_Items_Found}
            </Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={i => String(i.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </RBSheet>
    );
  },
);

export default Branches;

/* ---------------- styles ---------------- */
const getStyles = (language: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.White4,
      paddingHorizontal: '4%',
      paddingTop: Platform.OS === 'ios' ? '5%' : '5%',
      paddingBottom: Platform.OS === 'ios' ? '2%' : '2%',
    },
    sheetTitle: {
      fontSize: 16,
      color: Colors.Black,
      fontFamily: Fonts.SF_Bold,
      textAlign: language === 'ar' ? 'right' : 'left',
      marginBottom: 10,
    },
    listContent: {
      paddingBottom: 20,
    },
    itemContainer: {
      flexDirection: language === 'ar' ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: Colors.White,
      padding: 12,
      marginBottom: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      ...(Platform.OS === 'android' ? {elevation: 2} : null),
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: language === 'ar' ? 0 : 10,
      marginLeft: language === 'ar' ? 10 : 0,
      resizeMode: 'cover',
      backgroundColor: '#eee',
    },
    imgPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e9ecef',
    },
    itemInfo: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      color: Colors.Black,
      fontFamily: Fonts.SF_Bold,
      textAlign: language === 'ar' ? 'right' : 'left',
    },
    itemDescription: {
      marginTop: 4,
      fontSize: 12,
      color: '#555',
      fontFamily: Fonts.SF_Regular,
      lineHeight: 18,
      textAlign: language === 'ar' ? 'right' : 'left',
    },
    itemVenue: {
      marginTop: 6,
      fontSize: 12,
      color: Colors.Green,
      fontFamily: Fonts.SF_Medium,
      textAlign: language === 'ar' ? 'right' : 'left',
    },
    emptyText: {
      paddingVertical: 24,
      textAlign: 'center',
      color: '#666',
      fontFamily: Fonts.SF_Regular,
    },
  });
