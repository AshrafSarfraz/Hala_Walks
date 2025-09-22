import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchBrandsFromFirebase } from '../../../firebase/firebaseutils';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';

const { width } = Dimensions.get('screen');

const BestSeller: React.FC = () => {
  const navigation = useNavigation();
  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [brands, setBrands] = useState<any[]>([]);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // 1. Show cached data instantly
        const cachedData = await AsyncStorage.getItem('H-brands_cache');
        if (cachedData) {
          setBrands(JSON.parse(cachedData));
          setLoading(false);
        } else {
          // agar cache na mile to bhi shimmer max 1 sec
          setTimeout(() => setLoading(false), 1000);
        }

        // 2. Fetch fresh data in background
        const freshOffers = await fetchBrandsFromFirebase();
        if (freshOffers?.length) {
          setBrands(freshOffers);
          await AsyncStorage.setItem('H-brands_cache', JSON.stringify(freshOffers));
        }
      } catch (error) {
        console.error('Error loading offers:', error);
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const handleCardLoad = (id: string) =>
    setLoadedCards(prev => ({ ...prev, [id]: true }));

  const getDescription = (item: any) =>
    (language === 'en' ? item.descriptionEng : item.descriptionArabic)?.substring(0, 60) + '...';

  const renderShimmerItem = () => (
    <View style={styles.Flatlist_Cont}>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.image} />
    </View>
  );

  const renderBrandItem = ({ item, index }: { item: any; index: number }) => {
    const isLoaded = loadedCards[item.id] ?? false;
    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('DetailScreen', { item })}
      >
        <View
          style={{
            flexDirection: language === 'en' ? 'row' : 'row-reverse',
            alignItems: 'center',
          }}
        >
          <ShimmerPlaceholder
            visible={isLoaded}
            LinearGradient={LinearGradient}
            style={styles.image}
          >
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
              onLoadEnd={() => handleCardLoad(item.id)}
              // defaultSource={require('../../../assets/placeholder.png')} // instant fallback image
            />
          </ShimmerPlaceholder>

          <View style={styles.bestSeller_Detail}>
            <Text style={styles.title_txt}>
              {language === 'en'
                ? item.nameEng.length > 16
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
          data={brands.filter(item =>
            countryName
              ? item.selectedCountry?.toLowerCase() === countryName.toLowerCase()
              : true
          )}
          horizontal
          pagingEnabled
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={renderBrandItem}
        />
      )}
      <DetectCountry onCountryDetect={value => setCountry(value)} />
    </View>
  );
};

export default BestSeller;
