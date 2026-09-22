import {fetchBrandCatalog} from '../../api/brandCatalog';
import {Text} from '../../../ui/Text';
import {TextInput} from '../../../ui/TextInput';
import React, { useEffect, useState } from 'react';
import {View, FlatList, Image, TouchableOpacity, PermissionsAndroid, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { Location, Search } from '../../Themes/Images';
import { Colors } from '../../Themes/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DetectCountry from '../../Component/distanceCalculate/DetectCountry';
import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';
import Geolocation from '@react-native-community/geolocation';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const SelectedCategories: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation<any>();
  useStatusBar('light-content', Colors.dargBg);
  const { item } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const getBrandImage = (b: any) => {
    const hero = String(b?.heroImage || '').trim();
    if (hero) return hero;
    return String(b?.img || '').trim();
  };

  /* ================= LOCATION ================= */
  useEffect(() => {
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          console.log('✅ Location:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        error => console.log('❌ Location error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
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
          } else {
            console.log('❌ Permission denied');
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

  /* ================= LOAD BRANDS ================= */
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          const cached = JSON.parse(cachedData);
          const cachedArr = Array.isArray(cached) ? cached : [];
          const parsed = cachedArr
            .filter((b: any) => b?.status === 'Active')
            .filter((b: any) => b.selectedCategory?.toLowerCase() === item.text?.toLowerCase());
          setBrands(parsed);
          setLoading(false);
        }

        const res = await fetchBrandCatalog(BRANDS_API);
        const json = await res.json();

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const raw = json?.data ? json.data : json;
        const freshArr = Array.isArray(raw) ? raw : [];
        const normalizedFresh = freshArr.map((b: any) => ({ id: b._id || b.id, ...b }));

        const filteredFresh = normalizedFresh
          .filter((b: any) => b?.status === 'Active')
          .filter((b: any) => b.selectedCategory?.toLowerCase() === item.text?.toLowerCase());

        setBrands(filteredFresh);
        await AsyncStorage.setItem('H-brands_cache', JSON.stringify(normalizedFresh));
      } catch (err) {
        console.error('Error loading brands:', err);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, [item.text]);

  /* ========== PRELOAD IMAGES (detail screen ki bhi) ========== */
  useEffect(() => {
    if (!brands.length) return;

    const urls: { uri: string; priority: any; cache: any }[] = [];

    const push = (u: any) => {
      const s = String(u || '').trim();
      if (s) {
        urls.push({
          uri: s,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        });
      }
    };

    // top 15 brands ki saari images (heroImage + img + multiImageUrls)
    brands.slice(0, 15).forEach((b: any) => {
      push(b?.heroImage);
      push(b?.img);
      if (Array.isArray(b?.multiImageUrls)) {
        b.multiImageUrls.forEach(push);
      }
    });

    // baaki brands ki sirf list image
    brands.slice(15).forEach((b: any) => {
      push(b?.heroImage || b?.img);
    });

    if (urls.length) FastImage.preload(urls);
  }, [brands]);

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

  /* ================= NEAREST BRANCH ================= */
  const getNearestBranchPerBrand = (brandsList: any[], userLoc: { lat: number; long: number }) => {
    const brandMap: Record<string, any> = {};

    brandsList.forEach(branch => {
      if (!branch.latitude || !branch.longitude) return;

      const distance = haversineDistance(
        userLoc.lat,
        userLoc.long,
        Number(branch.latitude),
        Number(branch.longitude),
      );

      const key = String(branch.nameEng || branch.nameArabic || branch.id || branch._id || '');
      if (!key) return;

      if (!brandMap[key] || distance < brandMap[key].distance) {
        brandMap[key] = { ...branch, distance };
      }
    });

    return Object.values(brandMap).sort((a: any, b: any) => a.distance - b.distance);
  };

  /* ================= FILTER ================= */
  const filteredData = brands.filter(b =>
    b.nameEng?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const nearestBrands = userLocation
    ? getNearestBranchPerBrand(filteredData, userLocation)
    : filteredData;

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
      <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
    </View>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.darkgrey }}>
        <View style={{ paddingHorizontal: '4%', paddingBottom: 8, backgroundColor: Colors.darkgrey }}>
          <CustomHeader
            title={language === 'en' ? item.text : item.categoryArabic}
            onBackPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>

      <View style={{ flex: 1, paddingHorizontal: '4%', backgroundColor: Colors.dargBg }}>
        <View style={{ marginTop: '4%' }} />

        <View style={styles.searchContainer}>
          <Image source={Search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            placeholderTextColor='#ccc'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.FlatlistContainer}>
          {filteredData.length > 0 && !loading && (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          )}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(_, index) => index.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 20, marginBottom: 6, borderRadius: 4 }} />
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 15, marginBottom: 6, borderRadius: 4 }} />
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 12, width: '40%', borderRadius: 4 }} />
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : nearestBrands.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={nearestBrands.filter(b =>
                !countryName || b.selectedCountry?.toLowerCase() === countryName.toLowerCase(),
              )}
              keyExtractor={it => String(it.id || it._id)}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={8}
              renderItem={({ item: brandItem, index }) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', { item: brandItem })}>
                  <FastImage
                    source={{
                      uri: getBrandImage(brandItem),
                      priority: index <= 6 ? FastImage.priority.high : FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.itemImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {language === 'en'
                        ? brandItem.nameEng?.length > 30
                          ? brandItem.nameEng.substring(0, 30) + '...'
                          : brandItem.nameEng
                        : brandItem.nameArabic?.length > 30
                        ? brandItem.nameArabic.substring(0, 30) + '...'
                        : brandItem.nameArabic}
                    </Text>

                    <Text style={styles.itemLocation}>
                      {language === 'en'
                        ? brandItem.descriptionEng?.length > 70
                          ? brandItem.descriptionEng.substring(0, 70) + '...'
                          : brandItem.descriptionEng
                        : brandItem.descriptionArabic?.length > 70
                        ? brandItem.descriptionArabic.substring(0, 70) + '...'
                        : brandItem.descriptionArabic}
                    </Text>

                    <View style={styles.Loc_Status_Cont}>
                      <View style={styles.Loc_Cont}>
                        <Image source={Location} style={styles.LocationIcon} />
                        {userLocation ? (
                          <DistanceFromDevice
                            userLat={userLocation.lat}
                            userLong={userLocation.long}
                            targetLat={Number(brandItem.latitude)}
                            targetLong={Number(brandItem.longitude)}
                            kmText="km"
                            mText="m"
                          />
                        ) : (
                          <Text style={{ fontSize: 10, color: Colors.Red }}>--</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <DetectCountry onCountryDetect={value => setCountry(value)} />
      </View>
    </View>
  );
};

export default SelectedCategories;