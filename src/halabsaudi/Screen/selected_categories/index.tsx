import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';
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
import Geolocation from 'react-native-geolocation-service';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const SelectedCategories: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { item } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  // ✅ image priority: heroImage first, else img
  const getBrandImage = (b: any) => {
    const hero = String(b?.heroImage || '').trim();
    if (hero) return hero;
    return String(b?.img || '').trim();
  };

  // Request location and set userLocation
  useEffect(() => {
    const requestLocationPermission = async () => {
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
    };

    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        error => {
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    requestLocationPermission();
  }, []);

  // ✅ Load brands from API (instead of Firebase)
  useEffect(() => {
    const loadBrands = async () => {
      try {
        // 1) cache first
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          const cached = JSON.parse(cachedData);
          const cachedArr = Array.isArray(cached) ? cached : [];
          const parsed = cachedArr
            .filter((b: any) => b?.status === 'Active')
            .filter((b: any) => b.selectedCategory?.toLowerCase() === item.text?.toLowerCase());
          setBrands(parsed);
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

        const raw = (json && (json as any).data) ? (json as any).data : json;
        const freshArr = Array.isArray(raw) ? raw : [];

        // normalize id
        const normalizedFresh = freshArr.map((b: any) => ({
          id: b._id || b.id,
          ...b,
        }));

        // filter by category + Active
        const filteredFresh = normalizedFresh
          .filter((b: any) => b?.status === 'Active')
          .filter((b: any) => b.selectedCategory?.toLowerCase() === item.text?.toLowerCase());

        setBrands(filteredFresh);

        // store full fresh in cache (same as your old logic)
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

  // Haversine distance
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get nearest branch per brand
  const getNearestBranchPerBrand = (brandsList: any[], userLoc: { lat: number; long: number }) => {
    const brandMap: Record<string, any> = {};

    brandsList.forEach(branch => {
      if (!branch.latitude || !branch.longitude) return;

      const distanceInKm = haversineDistance(
        userLoc.lat,
        userLoc.long,
        Number(branch.latitude),
        Number(branch.longitude),
      );

      const key = String(branch.nameEng || branch.nameArabic || branch.id || branch._id || '');
      if (!key) return;

      if (!brandMap[key] || distanceInKm < brandMap[key].distance) {
        brandMap[key] = { ...branch, distance: distanceInKm };
      }
    });

    return Object.values(brandMap);
  };

  // Filtered brands based on search
  const filteredData = brands.filter(b =>
    b.nameEng?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Only nearest branches
  const nearestBrands = userLocation ? getNearestBranchPerBrand(filteredData, userLocation) : filteredData;

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
      <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} translucent backgroundColor={Colors.White4} barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White4, marginTop: 2 }}>
        <CustomHeader
          title={language === 'en' ? item.text : item.categoryArabic}
          onBackPress={() => navigation.goBack()}
        />

        <View style={{ marginTop: '7%' }} />
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
          {filteredData.length > 0 && !loading && (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          )}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(it, index) => index.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 20, marginBottom: 6 }} />
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 15, marginBottom: 6 }} />
                  </View>
                </View>
              )}
            />
          ) : nearestBrands.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={nearestBrands.filter(b => !countryName || b.selectedCountry?.toLowerCase() === countryName.toLowerCase())}
              keyExtractor={(it) => String(it.id || it._id)}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={8}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', { item })}
                >
                  <FastImage
                    source={{
                      uri: getBrandImage(item),
                      priority: index <= 6 ? FastImage.priority.high : FastImage.priority.normal,
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

      <DetectCountry onCountryDetect={(value) => setCountry(value)} />
    </View>
  );
};

export default SelectedCategories;
