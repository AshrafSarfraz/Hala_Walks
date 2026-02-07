import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {Location, Search} from '../../Themes/Images';
import {Colors} from '../../Themes/Colors';
import {RootState} from '../../redux_toolkit/store';

import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';
import {getStyles} from './style';
import {languageData} from '../../redux_toolkit/language/languageSlice';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; long: number} | null>(null);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((s: RootState) => s.language.language);

  const styles = getStyles(language);

  const norm = (v: any) => String(v ?? '').trim().toLowerCase();

  /* ================= LOCATION ================= */
  useEffect(() => {
    const requestPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          }
        } else {
          const status = await Geolocation.requestAuthorization('whenInUse');
          if (status === 'granted') getCurrentLocation();
        }
      } catch (e) {}
    };

    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        pos => {
          setUserLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          });
        },
        err => console.log(err),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    requestPermission();
  }, []);

  /* ================= DISTANCE ================= */
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  /* ========== NEAREST BRANCH PER BRAND + SORT ========== */
  const getNearestBranchPerBrand = (
    list: any[],
    userLoc: {lat: number; long: number},
  ) => {
    const map: Record<string, any> = {};

    list.forEach(item => {
      if (!item.latitude || !item.longitude) return;

      const distance = haversineDistance(
        userLoc.lat,
        userLoc.long,
        Number(item.latitude),
        Number(item.longitude),
      );

      const key = String(item?.nameEng || item?.nameArabic || item?.id || '');

      if (!map[key] || distance < map[key].distance) {
        map[key] = {...item, distance};
      }
    });

    // ✅ nearest → farthest
    return Object.values(map).sort(
      (a: any, b: any) => a.distance - b.distance,
    );
  };

  /* ================= LOAD BRANDS ================= */
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const cached = await AsyncStorage.getItem('H-brands_cache');
        if (cached) {
          const parsed = JSON.parse(cached).filter(
            (b: any) => norm(b.status) === 'active',
          );
          setBrands(parsed);
          setLoading(false);
        }

        const res = await fetch(BRANDS_API);
        const json = await res.json();

        const arr = Array.isArray(json?.data) ? json.data : [];
        const active = arr.filter((b: any) => norm(b.status) === 'active');

        setBrands(active);
        await AsyncStorage.setItem('H-brands_cache', JSON.stringify(active));
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  /* ================= SEARCH ================= */
  const filteredData = brands.filter(item => {
    if (norm(item.status) !== 'active') return false;
    if (!searchQuery) return true;

    return (
      norm(item.nameEng).includes(norm(searchQuery)) ||
      norm(item.nameArabic).includes(norm(searchQuery))
    );
  });

  const nearestBrands = userLocation
    ? getNearestBranchPerBrand(filteredData, userLocation)
    : filteredData;

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.White4} />
      <SafeAreaView style={{flex: 1}}>
        <CustomHeader
          title={language === 'en' ? 'Search Screen' : 'شاشة البحث'}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.searchContainer}>
          <Image source={Search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(_, i) => i.toString()}
            renderItem={() => (
              <View style={styles.itemContainer}>
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.itemImage}
                />
              </View>
            )}
          />
        ) : (
          <FlatList
            data={nearestBrands.filter(b =>
              countryName
                ? norm(b.selectedCountry) === norm(countryName)
                : true,
            )}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() =>
                  navigation.navigate('DetailScreen', {item})
                }>
                <FastImage
                  source={{uri: item.img}}
                  style={styles.itemImage}
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>
                    {language === 'en' ? item.nameEng : item.nameArabic}
                  </Text>

                  <View style={styles.Loc_Cont}>
                    <Image source={Location} style={styles.LocationIcon} />
                    <DistanceFromDevice
                      targetLat={item.latitude}
                      targetLong={item.longitude}
                      kmText="km"
                      mText="m"
                      loadingText="Calculating..."
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default SearchScreen;
