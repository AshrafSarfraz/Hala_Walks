import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';

const {width} = Dimensions.get('screen');
const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const BestSeller: React.FC = () => {
  const navigation = useNavigation<any>();
  const reduxCountry = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [brands, setBrands] = useState<any[]>([]);
  const [country, setCountry] = useState<string | null>(null); // DetectCountry se
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{[key: string]: boolean}>({});

  // ✅ normalize helper
  const norm = (v: any) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  // ✅ filters: Active + Country
  // const applyFilters = (list: any[]) => {
  //   const selectedCountry = reduxCountry || country;

  //   return list
  //     .filter(b => norm(b?.status) === 'active') // ✅ only Active
  //     .filter(b => {
  //       if (!selectedCountry) return true;
  //       return norm(b?.selectedCountry) === norm(selectedCountry);
  //     });
  // };


  const applyFilters = (list: any[]) => {
    const selectedCountry = reduxCountry || country;
  
    return list
      // 1️⃣ only Active
      .filter(b => norm(b?.status) === 'active')
  
      // 2️⃣ only Best Seller
      .filter(b => b?.isBestSeller === true)
  
      // 3️⃣ only selected country
      .filter(b => {
        if (!selectedCountry) return false; // ❗ best seller screen → country must
        return norm(b?.selectedCountry) === norm(selectedCountry);
      });
  };
  

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // 1) cache first
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const arr = Array.isArray(parsed) ? parsed : [];
          setBrands(arr);
          setLoading(false);
        } else {
          setTimeout(() => setLoading(false), 1000);
        }

        // 2) fetch fresh
        const res = await fetch(BRANDS_API);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('Brands API failed:', json);
          return;
        }

        const raw = json && (json as any).data ? (json as any).data : json;
        const arr = Array.isArray(raw) ? raw : [];

        const freshOffers = arr.map((item: any) => ({
          id: item._id || item.id,
          ...item,
        }));

        if (freshOffers.length) {
          setBrands(freshOffers);
          await AsyncStorage.setItem('H-brands_cache', JSON.stringify(freshOffers));
        }
      } catch (error) {
        console.error('Error loading offers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  // ✅ Re-filter when reduxCountry OR detected country changes
  const filteredBrands = applyFilters(brands);

  const handleCardLoad = (id: string) =>
    setLoadedCards(prev => ({...prev, [id]: true}));

  const getDescription = (item: any) =>
    (((language === 'en' ? item.descriptionEng : item.descriptionArabic) || '')
      .substring(0, 60) + '...');

  const renderShimmerItem = () => (
    <View style={styles.Flatlist_Cont}>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.image} />
    </View>
  );

  const renderBrandItem = ({item, index}: {item: any; index: number}) => {
    const isLoaded = loadedCards[item.id] ?? false;

    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('DetailScreen', {item})}>
        <View
          style={{
            flexDirection: language === 'en' ? 'row' : 'row-reverse',
            alignItems: 'center',
          }}>
          <ShimmerPlaceholder
            visible={isLoaded}
            LinearGradient={LinearGradient}
            style={styles.image}>
            <FastImage
              source={{
                uri: item.img,
                priority:
                  index === 0
                    ? FastImage.priority.high
                    : index <= 2
                    ? FastImage.priority.normal
                    : FastImage.priority.low,
              }}
              style={styles.image}
              onLoadEnd={() => handleCardLoad(String(item.id))}
            />
          </ShimmerPlaceholder>

          <View style={styles.bestSeller_Detail}>
            <Text style={styles.title_txt}>
              {language === 'en'
                ? item.nameEng?.length > 16
                  ? item.nameEng.substring(0, 16) + '...'
                  : item.nameEng
                : item.nameArabic}
            </Text>

            <Text style={styles.desc_txt}>{getDescription(item)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <FlatList
          data={[...Array(5).keys()]}
          horizontal
          keyExtractor={item => item.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={renderShimmerItem}
        />
      ) : (
        <FlatList
          data={filteredBrands} // ✅ Active + Country
          horizontal
          pagingEnabled
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={renderBrandItem}
        />
      )}

      <DetectCountry onCountryDetect={value => setCountry(value)} />
    </View>
  );
};

export default BestSeller;
