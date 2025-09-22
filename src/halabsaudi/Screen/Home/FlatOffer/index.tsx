import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import { fetchFlatOfferFromFirebase } from '../../../firebase/firebaseutils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';

import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

const ImageSlider: React.FC<{ navigation: any }> = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState<any[]>([]); // State to store Firestore data
   const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
   const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  // useEffect(() => {
  //   const getFlatOffer = async () => {
  //     setLoading(true);
  //     const fetchedOffers = await fetchFlatOfferFromFirebase();
  //     setOffers(fetchedOffers);
  //     setLoading(false);
  //   };

  //   getFlatOffer();
  // }, []);


  useEffect(() => {
    const loadOffers = async () => {
      try {
        // Show cached data immediately
        const cachedData = await AsyncStorage.getItem('H-Offer_cache');
        if (cachedData) {
          setOffers(JSON.parse(cachedData));
          setLoading(false);
        }
  
        // Then fetch in background
        const freshOffers = await fetchFlatOfferFromFirebase();
        setOffers(freshOffers);
        await AsyncStorage.setItem('H-Offer_cache', JSON.stringify(freshOffers));
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

  const handleImageLoad = () => {
    setImageLoading(false); // Stop the shimmer when image has loaded
  };

  const handleImageError = () => {
    setImageLoading(false); // Stop the shimmer in case of an error
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ShimmerPlaceholder
          visible={false}
          LinearGradient={LinearGradient}
          style={styles.image}
        />
      ) : (
        <FlatList
        data={
          offers.filter((item )=> {
            if (countryName) {
              return item.selectedCountry?.toLowerCase() === countryName.toLowerCase();
            }
            return true; // agar country detect na ho to sab items dikhao
          })
        } // Use Firestore data
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => navigation.navigate('DetailScreen', { item })}
            >
              {/* Shimmer effect for image */}
              <ShimmerPlaceholder
                visible={!imageLoading}
                LinearGradient={LinearGradient}
                style={styles.image}
              >
                {
             
                    <FastImage source={{ uri: item.img, priority: index <=2 ? FastImage.priority.high : index <= 4 ? FastImage.priority.normal : FastImage.priority.low }}
                    style={styles.image}  onLoad={handleImageLoad}    onError={handleImageError}  />
                }
              
                </ShimmerPlaceholder>

              {/* <View style={styles.overlay}>
                <Text style={styles.imageText}>
                  {languageData[language].discount + item.discount + '%'}
                </Text>
              </View> */}
            </TouchableOpacity>
          )}
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
