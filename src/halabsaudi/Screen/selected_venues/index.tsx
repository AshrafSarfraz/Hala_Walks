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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Search} from '../../Themes/Images';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import {getStyles} from './style';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {Colors} from '../../Themes/Colors';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import DetectCountry from '../../Component/distanceCalculate/DetectCountry';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const SelectedVenues: React.FC<{route: any}> = ({route}) => {
  const navigation = useNavigation<any>();
  const {item} = route.params; // item.venueName / item.venueNameAr / item.country etc

  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState<string | null>(null);

  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({});

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  // ✅ normalize helper (trim + lowercase + collapse spaces + normalize &)
  const norm = (v: any) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/＆/g, '&');

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({...prev, [id]: true}));
  };

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const venueName = item?.venueName; // English venue name
        const venueNameNorm = norm(venueName);

        // 1) ✅ cache first (instant)
        const cached = await AsyncStorage.getItem('H-brands_cache');
        if (cached) {
          const cachedArr = JSON.parse(cached);
          const arr = Array.isArray(cachedArr) ? cachedArr : [];

          const matchedCached = arr
            .map((b: any) => ({id: b._id || b.id, ...b}))
            .filter((b: any) => norm(b?.status) === 'active') // ✅ Active only
            .filter((b: any) => norm(b?.selectedVenue) === venueNameNorm);

          setFilteredItems(matchedCached);
          setLoading(false);
        }

        // 2) ✅ fresh API
        const res = await fetch(BRANDS_API);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('Brands API failed:', json);
          setLoading(false);
          return;
        }

        const raw = json && (json as any).data ? (json as any).data : json;
        const arr = Array.isArray(raw) ? raw : [];

        const normalizedFresh = arr.map((b: any) => ({
          id: b._id || b.id,
          ...b,
        }));

        // ✅ store fresh full cache (optional)
        await AsyncStorage.setItem('H-brands_cache', JSON.stringify(normalizedFresh));

        const matchedFresh = normalizedFresh
          .filter((b: any) => norm(b?.status) === 'active') // ✅ Active only
          .filter((b: any) => norm(b?.selectedVenue) === venueNameNorm);

        setFilteredItems(matchedFresh);
      } catch (error) {
        console.error('❌ Error fetching offers:', error);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [item?.venueName]); // ✅ correct dependency

  // ✅ search inside matched venue items
  const searchFiltered = filteredItems.filter(entry => {
    const q = norm(searchQuery);
    if (!q) return true;
    const en = norm(entry?.nameEng);
    const ar = norm(entry?.nameArabic);
    return en.includes(q) || ar.includes(q);
  });

  // ✅ apply country filter (DetectedCountry), fallback: show all
  const finalData = searchFiltered.filter(b => {
    if (country) return norm(b?.selectedCountry) === norm(country);
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.White4}
        barStyle="dark-content"
      />

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
          {finalData.length > 0 && !loading ? (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          ) : null}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{paddingBottom: 20}}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder visible={false} LinearGradient={LinearGradient} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{width: '70%', height: 16, borderRadius: 5, marginBottom: 6}}
                    />
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{width: '90%', height: 14, borderRadius: 5, marginBottom: 4}}
                    />
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{width: '40%', height: 12, borderRadius: 5}}
                    />
                  </View>
                </View>
              )}
            />
          ) : finalData.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={require('../../assets/Images/no_data.png')}
                style={styles.emptyStateImage}
              />
              <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
            </View>
          ) : (
            <FlatList
              data={finalData}
              keyExtractor={it => String(it.id)}
              contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
              showsVerticalScrollIndicator={false}
              renderItem={({item: rowItem, index}) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', {item: rowItem})}>
                  <ShimmerPlaceholder
                    visible={imageLoaded[String(rowItem.id)] || false}
                    LinearGradient={LinearGradient}
                    style={styles.itemImage}>
                    <FastImage
                      source={{
                        uri: rowItem.img,
                        priority:
                          index <= 6
                            ? FastImage.priority.high
                            : index <= 10
                            ? FastImage.priority.normal
                            : FastImage.priority.low,
                      }}
                      style={styles.itemImage}
                      onLoadEnd={() => handleImageLoad(String(rowItem.id))}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </ShimmerPlaceholder>

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
              )}
            />
          )}
        </View>
      </SafeAreaView>

      <DetectCountry onCountryDetect={value => setCountry(value)} />
    </View>
  );
};

export default SelectedVenues;
