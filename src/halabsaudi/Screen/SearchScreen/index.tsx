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

import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {Location, Search} from '../../Themes/Images';

import {Colors} from '../../Themes/Colors';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {getStyles} from './style';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; long: number} | null>(null);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const norm = (v: any) => String(v ?? '').trim().toLowerCase();

  // Request location and set userLocation
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          }
        } else {
          const authStatus = await Geolocation.requestAuthorization('whenInUse');
          if (authStatus === 'granted') getCurrentLocation();
        }
      } catch (e) {
        // ignore
      }
    };

    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        error => console.error(error),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    requestLocationPermission();
  }, []);

  // Haversine distance
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get nearest branch per brand
  const getNearestBranchPerBrand = (brandsList: any[], userLoc: {lat: number; long: number}) => {
    const brandMap: Record<string, any> = {};

    brandsList.forEach(branch => {
      if (!branch.latitude || !branch.longitude) return;

      const distanceInKm = haversineDistance(
        userLoc.lat,
        userLoc.long,
        Number(branch.latitude),
        Number(branch.longitude),
      );

      // key: brand name (fallback id)
      const key = String(branch?.nameEng || branch?.nameArabic || branch?.id || '');
      if (!key) return;

      if (!brandMap[key] || distanceInKm < brandMap[key].distance) {
        brandMap[key] = {...branch, distance: distanceInKm};
      }
    });

    return Object.values(brandMap);
  };

  // Load brands (cache first, then fresh)
  useEffect(() => {
    const loadBrands = async () => {
      try {
        // 1) cache first
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          const cached = JSON.parse(cachedData);
          const cachedArr = Array.isArray(cached) ? cached : [];

          // ✅ only Active in cache display
          const onlyActiveCached = cachedArr.filter(
            (b: any) => norm(b?.status) === 'active',
          );

          setBrands(onlyActiveCached);
          setLoading(false);
        } else {
          setLoading(true);
        }

        // 2) fresh API
        const res = await fetch(BRANDS_API);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('Brands API failed:', json);
          setLoading(false);
          return;
        }

        const raw = json && (json as any).data ? (json as any).data : json;
        const arr = Array.isArray(raw) ? raw : [];

        const normalized = arr.map((item: any) => ({
          id: item._id || item.id,
          ...item,
        }));

        // ✅ only Active
        const onlyActive = normalized.filter((b: any) => norm(b?.status) === 'active');

        if (onlyActive.length > 0) {
          setBrands(onlyActive);
          await AsyncStorage.setItem('H-brands_cache', JSON.stringify(onlyActive));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading brands:', error);
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  // ✅ ACTIVE + search (english + arabic)
  const filteredData = brands.filter(item => {
    const isActive = norm(item?.status) === 'active';
    if (!isActive) return false;

    const q = norm(searchQuery);
    if (!q) return true;

    const en = norm(item?.nameEng);
    const ar = norm(item?.nameArabic);
    return en.includes(q) || ar.includes(q);
  });

  // Only nearest branches
  const nearestBrands = userLocation
    ? getNearestBranchPerBrand(filteredData, userLocation)
    : filteredData;

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image
        source={require('../../assets/Images/no_data.png')}
        style={styles.emptyStateImage}
      />
      <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} translucent animated backgroundColor={Colors.White4} />
      <SafeAreaView style={{flex: 1}}>
        <CustomHeader
          title={language === 'en' ? 'Search Screen' : 'شاشة البحث'}
          onBackPress={() => navigation.goBack()}
        />

        <View style={{marginTop: '7%'}} />

        <View style={styles.searchContainer}>
          <Image source={Search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            placeholderTextColor={Colors.Grey5}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.FlatlistContainer}>
          {filteredData.length > 0 && !loading ? (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          ) : null}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(_, index) => index.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      style={{height: 20, marginBottom: 6}}
                    />
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      style={{height: 15, marginBottom: 6}}
                    />
                  </View>
                </View>
              )}
            />
          ) : filteredData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={nearestBrands.filter(item => {
                // ✅ country filter (optional)
                if (countryName) {
                  return norm(item.selectedCountry) === norm(countryName);
                }
                return true;
              })}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
              showsVerticalScrollIndicator={false}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', {item})}>
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
                    resizeMode={FastImage.resizeMode.cover}
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {language === 'en'
                        ? item.nameEng?.length > 30
                          ? item.nameEng.substring(0, 30) + '...'
                          : item.nameEng
                        : item.nameArabic?.length > 30
                        ? item.nameArabic.substring(0, 30) + '...'
                        : item.nameArabic}
                    </Text>

                    <Text style={styles.itemLocation}>
                      {language === 'en'
                        ? item.descriptionEng?.length > 70
                          ? item.descriptionEng.substring(0, 70) + '...'
                          : item.descriptionEng
                        : item.descriptionArabic?.length > 70
                        ? item.descriptionArabic.substring(0, 70) + '...'
                        : item.descriptionArabic}
                    </Text>

                    <View style={styles.Loc_Status_Cont}>
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
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SearchScreen;
