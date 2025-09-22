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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { Location, Search } from '../../Themes/Images';
import { fetchBrandsFromFirebase } from '../../firebase/firebaseutils';
import { Colors } from '../../Themes/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

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

      // Haversine distance
  const haversineDistance = (lat1:number, lon1:number, lat2:number, lon2:number) => {
        const toRad = (value:number) => (value * Math.PI) / 180;
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
  
        // Get nearest branch per brand
    const getNearestBranchPerBrand = (brandsList: any[], userLoc: {lat:number, long:number}) => {
     const brandMap: Record<string, any> = {};
  
      brandsList.forEach(branch => {
        if (!branch.latitude || !branch.longitude) return;
        const distanceInKm = haversineDistance(
          userLoc.lat,
          userLoc.long,
          branch.latitude,
          branch.longitude
        );
  
        if (!brandMap[branch.nameEng] || distanceInKm < brandMap[branch.nameEng].distance) {
          brandMap[branch.nameEng] = { ...branch, distance: distanceInKm };
        }
      });
  
      return Object.values(brandMap);
    };

  useEffect(() => {
    const loadBrands = async () => {
      try {
        // Pehle check karo cache
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          setBrands(JSON.parse(cachedData));
          setLoading(false); // 🚀 Cached data mil gaya → loading hata do
        } else {
          setLoading(true); // Agar cache nahi hai to hi shimmer dikhana
        }
  
        // Background me Firebase se fresh data fetch karo
        const freshData = await fetchBrandsFromFirebase();
        if (freshData.length > 0) {
          setBrands(freshData);
          await AsyncStorage.setItem('H-brands_cache', JSON.stringify(freshData));
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        setLoading(false);
      }
    };
  
    loadBrands();
  }, []);




  const filteredData = brands.filter(item =>
    item.nameEng?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const nearestBrands = userLocation ? getNearestBranchPerBrand(filteredData, userLocation) : filteredData;
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
      <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} />
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader
          title={language === 'en' ? 'Search Screen' : 'شاشة البحث'}
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
          {filteredData.length > 0 && !loading ? (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          ) : null}

          {loading ? (
            // sirf initial shimmer skeleton
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(item, index) => index.toString()}
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
          ) : filteredData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={
                nearestBrands.filter(item => {
                  if (countryName) {
                    return item.selectedCountry?.toLowerCase() === countryName.toLowerCase();
                  }
                  return true;
                })
              }
              keyExtractor={item => item.id}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', { item })}
                >
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
                    // defaultSource={require('../../assets/Images/placeholder.png')} // fallback image
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                       {language === 'en'
                                           ? item.nameEng?.length > 30
                                             ? item.nameEng.substring(0,30) + '...'
                                             : item.nameEng
                                           : item.nameArabic?.length > 30
                                           ? item.nameArabic.substring(0,30) + '...'
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


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// import CustomHeader from '../../Component/CustomHeader/CustomHeader';
// import { Search } from '../../Themes/Images';
// import { fetchBrandsFromFirebase } from '../../firebase/firebaseutils';
// import { Colors } from '../../Themes/Colors';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux_toolkit/store';
// import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
// import { getStyles } from './style';
// import { languageData } from '../../redux_toolkit/language/languageSlice';
// import LinearGradient from 'react-native-linear-gradient';

// import FastImage from 'react-native-fast-image';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const SearchScreen: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [brands, setBrands] = useState<any[]>([]);
//   const [country, setCountry] = useState<string | null>(null);
//   const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(true);

//   const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
//   const language = useSelector((state: RootState) => state.language.language);
//   const styles = getStyles(language);

//   // useEffect(() => {
//   //   const getBrands = async () => {
//   //     setLoading(true);
//   //     const fetchedBrands = await fetchBrandsFromFirebase();
//   //     setBrands(fetchedBrands);
//   //     setLoading(false);
//   //   };

//   //   getBrands();
//   // }, []);

//   useEffect(() => {
//     const loadOffers = async () => {
//       try {
//         // Show cached data immediately
//         const cachedData = await AsyncStorage.getItem('H-brands_cache');
//         if (cachedData) {
//           setBrands(JSON.parse(cachedData));
//           setLoading(false);
//         }
  
//         // Then fetch in background
//         const freshOffers = await fetchBrandsFromFirebase();
//         setBrands(freshOffers);
//         await AsyncStorage.setItem('H-brands_cache', JSON.stringify(freshOffers));
//       } catch (error) {
//         console.error('Error loading offers:', error);
//         setLoading(false);
//       }
//     };
  
//     loadOffers();
//   }, []);
  

//   const filteredData = brands.filter(item =>
//     item.nameEng?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleImageLoad = (id: string) => {
//     setImageLoaded(prev => ({
//       ...prev,
//       [id]: true,
//     }));
//   };

//   const renderEmptyState = () => (
//     <View style={styles.emptyStateContainer}>
//       <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
//       <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar hidden={true} translucent={true} animated={true} />
//       <SafeAreaView style={{ flex: 1 }}>
//         <CustomHeader
//           title={language === 'en' ? 'Search Screen' : 'شاشة البحث'}
//           onBackPress={() => navigation.goBack()}
//         />

//         <View style={{ marginTop: '7%' }} />
//         <View style={styles.searchContainer}>
//           <Image source={Search} style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={languageData[language].Search_for_anything}
//             placeholderTextColor={Colors.Grey5}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>

//         <View style={styles.FlatlistContainer}>
//           {filteredData.length > 0 && !loading ? (
//             <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
//           ) : null}

//           {loading ? (
//             <FlatList
//               data={[1, 2, 3, 4, 5, 6]}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={() => (
//                 <View style={styles.itemContainer}>
//                   <ShimmerPlaceholder  visible={false}    LinearGradient={LinearGradient}  style={styles.itemImage} />
//                   <View style={styles.itemInfo}>
//                     <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 20, marginBottom: 6 }} />
//                     <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 15, marginBottom: 6 }} />
//                     <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 15, width: 80 }} />
//                   </View>
//                 </View>
//               )}
//             />
//           ) : filteredData.length === 0 ? (
//             renderEmptyState()
//           ) : (
//             <FlatList
//             data={
//               filteredData.filter(item => {
//                 if (countryName) {
//                   return item.selectedCountry?.toLowerCase() === countryName.toLowerCase();
//                 }
//                 return true; // agar country detect na ho to sab items dikhao
//               })
//             }
//               keyExtractor={item => item.id}
//               contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
//               showsVerticalScrollIndicator={false}
//               renderItem={({ item,index }) => {
//                const isLoaded = imageLoaded[item.id] || false;
//                 return (
//                   <TouchableOpacity
//                     style={styles.itemContainer}
//                     onPress={() => navigation.navigate('DetailScreen', { item })}
//                   >
//                  <ShimmerPlaceholder
//                       visible={isLoaded}
//                       LinearGradient={LinearGradient}
//                       style={styles.itemImage} >
//                            <FastImage source={{ uri: item.img, priority: index <=6 ? FastImage.priority.high : index <= 10 ? FastImage.priority.normal : FastImage.priority.low }}
//                           style={styles.itemImage}   onLoad={() => handleImageLoad(item.id)}    />
//                       </ShimmerPlaceholder>



//                       <View style={styles.itemInfo}>
//                         <Text style={styles.itemTitle}>
//                           {language === 'en' ? item.nameEng : item.nameArabic}
//                         </Text>
//                         <Text style={styles.itemLocation}>
//                           {language === 'en'
//                             ? item.descriptionEng?.length > 70
//                               ? item.descriptionEng.substring(0, 70) + '...'
//                               : item.descriptionEng
//                             : item.descriptionArabic?.length > 70
//                             ? item.descriptionArabic.substring(0, 70) + '...'
//                             : item.descriptionArabic}
//                         </Text>
              
//                         <Text style={styles.itemCity}>{item.selectedVenue}</Text>
//                         {/* <Text style={styles.itemCity}>{item.selectedCity}</Text> */}
           
//                       </View>
//                   </TouchableOpacity>
//                 );
//               }}
//             />
//           )}
//         </View>
//       </SafeAreaView>
   
//     </View>
//   );
// };

// export default SearchScreen;
