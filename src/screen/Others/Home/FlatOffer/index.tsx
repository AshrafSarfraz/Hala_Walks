import React, { useState, useEffect } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { useSelector } from 'react-redux';
import { getStyles } from './style';
import { RootState } from '../../../../redux/store';
import { fetchFlatOfferFromFirebase } from '../../../../firebase/firebaseutils';

const { width } = Dimensions.get('screen');

const ImageSlider: React.FC<{ navigation: any }> = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      try {
        // Try to load cached data first
        const cachedData = await AsyncStorage.getItem('offers');
        if (cachedData) {
          setOffers(JSON.parse(cachedData));
          setLoading(false);
        }

        // Fetch fresh data from Firebase
        const freshOffers = await fetchFlatOfferFromFirebase();
        setOffers(freshOffers);
        setLoading(false);

        // Save fresh data to AsyncStorage
        await AsyncStorage.setItem('offers', JSON.stringify(freshOffers));
      } catch (error) {
        console.error('Error loading offers:', error);
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  const renderItem = ({ item }: { item: any }) => {
    const isLoaded = imageLoaded[item.id] ?? false;

    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => navigation.navigate('DetailScreen', { item })}
      >
        <ShimmerPlaceholder
          visible={isLoaded}
          LinearGradient={LinearGradient}
          style={styles.image}
        >
          <FastImage
            source={{ uri: item.img, priority: FastImage.priority.normal }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
            onLoad={() => handleImageLoad(item.id)}
            onError={() => handleImageLoad(item.id)}
          />
        </ShimmerPlaceholder>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && offers.length === 0 ? (
        <ShimmerPlaceholder
          visible={false}
          LinearGradient={LinearGradient}
          style={styles.image}
        />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={renderItem}
        />
      )}

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? '#31386A' : '#A2A2A2',
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
