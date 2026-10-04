import {fetchBrandCatalog} from '../../../api/brandCatalog';
import {Text} from '../../../../ui/Text';
import React, {useEffect, useState} from 'react';
import {View, FlatList, TouchableOpacity, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';

const {width} = Dimensions.get('screen');
const BRANDS_API = 'https://hala-b-saudi.onrender.com/api/hbs/brands';

const BestSeller: React.FC<{onDataLoaded?: (hasData: boolean) => void; onLoadError?: () => void}> = ({onDataLoaded, onLoadError}) => {
  const navigation = useNavigation<any>();
  const reduxCountry = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{[key: string]: boolean}>({});

  const norm = (v: any) =>
    String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

  const applyFilters = (list: any[]) => {
    return list
      .filter(b => norm(b?.status) === 'active')
      .filter(b => b?.isBestSeller === true)
      .filter(b => {
        if (!reduxCountry) return false;
        return norm(b?.selectedCountry) === norm(reduxCountry);
      });
  };

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const arr = Array.isArray(parsed) ? parsed : [];
          setBrands(arr);
          setLoading(false);
        }

        const res = await fetchBrandCatalog(BRANDS_API);
        const json = await res.json();

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

        setBrands(freshOffers);
        await AsyncStorage.setItem('H-brands_cache', JSON.stringify(freshOffers));
      } catch (error) {
        console.error('Error loading offers:', error);
        onLoadError?.();
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const filteredBrands = applyFilters(brands);

  // ✅ Parent ko notify karo jab loading khatam ho
  useEffect(() => {
    if (!loading) {
      onDataLoaded?.(filteredBrands.length > 0);
    }
  }, [filteredBrands.length, loading]);

  const handleCardLoad = (id: string) =>
    setLoadedCards(prev => ({...prev, [id]: true}));

  const getDescription = (item: any) =>
    ((language === 'en' ? item.descriptionEng : item.descriptionArabic) || '').substring(0, 60) + '...';

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
        <View style={{flexDirection: language === 'en' ? 'row' : 'row-reverse', alignItems: 'center'}}>
          <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={styles.image}>
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

  // ✅ Loading khatam ho aur data nahi to kuch render mat karo
  if (!loading && filteredBrands.length === 0) return null;

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
          data={filteredBrands}
          horizontal
          pagingEnabled
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={renderBrandItem}
        />
      )}
    </View>
  );
};

export default BestSeller;