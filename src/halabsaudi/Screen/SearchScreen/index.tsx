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
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation'; // ✅ wapas add kiya
import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';
import {getStyles} from './style';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  useStatusBar('dark-content', Colors.White4, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; long: number} | null>(null);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((s: RootState) => s.language.language);
  const styles = getStyles(language);

  const norm = (v: any) => String(v ?? '').trim().toLowerCase();

  const getBrandImage = (b: any) => {
    const hero = String(b?.heroImage || '').trim();
    if (hero) return hero;
    return String(b?.img || '').trim();
  };

  /* ================= LOCATION ================= */
  useEffect(() => {
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        pos => {
          console.log('✅ Location got:', pos.coords); // debug ke liye
          setUserLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          });
        },
        err => console.log('❌ Location error:', err),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    const requestPermission = async () => {
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
          } else {
            console.log('❌ Permission denied');
          }
        } else {
          // iOS
          Geolocation.requestAuthorization();
          getCurrentLocation();
        }
      } catch (e) {
        console.log('Permission error:', e);
      }
    };

    requestPermission();
  }, []);

  /* ================= DISTANCE ================= */
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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

      const key = String(item?.nameEng || item?.nameArabic || item?.id || item?._id || '');
      if (!key) return;

      if (!map[key] || distance < map[key].distance) {
        map[key] = {...item, distance};
      }
    });

    return Object.values(map).sort((a: any, b: any) => a.distance - b.distance);
  };

  /* ================= LOAD BRANDS ================= */
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const cached = await AsyncStorage.getItem('H-brands_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const cachedArr = Array.isArray(parsed) ? parsed : [];
          const activeCached = cachedArr.filter((b: any) => norm(b.status) === 'active');
          setBrands(activeCached);
          setLoading(false);
        }

        const res = await fetch(BRANDS_API);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const arr = Array.isArray(json?.data) ? json.data : [];
        const normalized = arr.map((b: any) => ({id: b._id || b.id, ...b}));
        const active = normalized.filter((b: any) => norm(b.status) === 'active');

        setBrands(active);
        await AsyncStorage.setItem('H-brands_cache', JSON.stringify(normalized));
      } catch (e) {
        console.log('loadBrands error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  /* ================= FILTER + SORT ================= */
  const filteredData = brands.filter(item => {
    if (norm(item.status) !== 'active') return false;

    const matchesSearch =
      !searchQuery ||
      norm(item.nameEng).includes(norm(searchQuery)) ||
      norm(item.nameArabic).includes(norm(searchQuery));

    const matchesCountry = countryName
      ? norm(item.selectedCountry) === norm(countryName)
      : true;

    return matchesSearch && matchesCountry;
  });

  const nearestBrands = userLocation
    ? getNearestBranchPerBrand(filteredData, userLocation)
    : filteredData;

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image
        source={require('../../assets/Images/no_data.png')}
        style={styles.emptyStateImage}
      />
      <Text style={styles.emptyStateText}>
        {languageData[language].No_Items_Found}
      </Text>
    </View>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: Colors.darkgrey, marginTop: 2}}>
        <View style={{paddingHorizontal: '4%', paddingBottom: 5}}>
        <CustomHeader
          title={language === 'en' ? 'Search Screen' : 'شاشة البحث'}
          onBackPress={() => navigation.goBack()}
        />
        </View>
        </SafeAreaView>
<View style={{flex:1,paddingHorizontal: '4%', backgroundColor:Colors.dargBg}}>
        <View style={{marginTop: '7%'}} />

        <View style={styles.searchContainer}>
          <Image source={Search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            placeholderTextColor={Colors.White}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.FlatlistContainer}>
          {filteredData.length > 0 && !loading && (
            <Text style={styles.FoundItem_Txt}>
              {languageData[language].Found_Items}
            </Text>
          )}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(_, i) => i.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{height: 20, marginBottom: 6, borderRadius: 4}} />
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{height: 15, marginBottom: 6, borderRadius: 4}} />
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{height: 12, width: '40%', borderRadius: 4}} />
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : nearestBrands.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={nearestBrands}
              keyExtractor={item => String(item.id || item._id)}
              contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={8}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', {item})}>
                  <FastImage
                    source={{
                      uri: getBrandImage(item),
                      priority: index <= 6 ? FastImage.priority.high : FastImage.priority.normal,
                    }}
                    style={styles.itemImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {language === 'en'
                        ? item.nameEng?.length > 30 ? item.nameEng.substring(0, 30) + '...' : item.nameEng
                        : item.nameArabic?.length > 30 ? item.nameArabic.substring(0, 30) + '...' : item.nameArabic}
                    </Text>

                    <Text style={styles.itemLocation}>
                      {language === 'en'
                        ? item.descriptionEng?.length > 70 ? item.descriptionEng.substring(0, 70) + '...' : item.descriptionEng
                        : item.descriptionArabic?.length > 70 ? item.descriptionArabic.substring(0, 70) + '...' : item.descriptionArabic}
                    </Text>

                    <View style={styles.Loc_Status_Cont}>
                      <View style={styles.Loc_Cont}>
                        <Image source={Location} style={styles.LocationIcon} />
                        {/* ✅ userLocation mile tab hi show karo */}
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
                          <Text style={{fontSize: 10, color: 'green'}}>--</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default SearchScreen;