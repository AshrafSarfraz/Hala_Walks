import React, { useState, useEffect } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';

import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

const ImageSlider: React.FC<{ navigation: any }> = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // NOTE: one global loading boolean causes issues with FlatList (one image loads -> shimmer off for all)
  // We'll keep it simple but make it safe: shimmer shows until first image loads
  const [imageLoading, setImageLoading] = useState(true);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  // ✅ ONLY: heroImage first, otherwise img
  const getHeroImage = (item: any) => {
    const hero = String(item?.heroImage || '').trim();
    if (hero) return hero;

    const logo = String(item?.img || '').trim();
    return logo;
  };

  useEffect(() => {
    const loadOffersFromBrands = async () => {
      try {
        // cache first
        const cachedData = await AsyncStorage.getItem('H-Offer_cache');
        if (cachedData) {
          setOffers(JSON.parse(cachedData));
          setLoading(false);
        } else {
          setLoading(true);
        }

        // fetch brands
        const res = await fetch('https://hala-b-saudi.onrender.com/api/hbs/brands');
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('Brands API failed:', json);
          setLoading(false);
          return;
        }

        const raw = json && (json as any).data ? (json as any).data : json;
        const arr = Array.isArray(raw) ? raw : [];

        // ✅ Only isFlatOffer true (top-level)
        const flatOffers = arr
          .map((item: any) => ({ id: item._id || item.id, ...item }))
          .filter((item: any) => item.isFlatOffer === true);

        setOffers(flatOffers);
        await AsyncStorage.setItem('H-Offer_cache', JSON.stringify(flatOffers));
        setLoading(false);
      } catch (error) {
        console.error('Error loading offers:', error);
        setLoading(false);
      }
    };

    loadOffersFromBrands();
  }, []);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => setImageLoading(false);

  // country filter
  const visibleOffers = offers.filter((item: any) => {
    if (countryName) {
      return item.selectedCountry?.toLowerCase() === countryName.toLowerCase();
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {loading ? (
        <ShimmerPlaceholder visible={false} LinearGradient={LinearGradient} style={styles.image} />
      ) : (
        <FlatList
          data={visibleOffers}
          keyExtractor={(item) => String(item.id)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => navigation.navigate('DetailScreen', { item })}
            >
              <ShimmerPlaceholder
                visible={!imageLoading}
                LinearGradient={LinearGradient}
                style={styles.image}
              >
                <FastImage
                  source={{
                    uri: getHeroImage(item),
                    priority:
                      index <= 2
                        ? FastImage.priority.high
                        : index <= 4
                        ? FastImage.priority.normal
                        : FastImage.priority.low,
                  }}
                  style={styles.image}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </ShimmerPlaceholder>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.pagination}>
        {visibleOffers.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? '#005029' : '#A2A2A2',
                width: index === currentIndex ? 30 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageSlider;
