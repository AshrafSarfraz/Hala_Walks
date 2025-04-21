import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';


import { useSelector } from 'react-redux';


import { getStyles } from './style';
import { RootState } from '../../../redux/store';
import { OfferdummyData } from './DummyData';

const { width } = Dimensions.get('screen');

const ImageSlider: React.FC<{ navigation: any }> = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState<any[]>([]); // State to store Firestore data
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
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
    const getBrands = async () => {
      setLoading(true);
      setTimeout(() => {
        setOffers(OfferdummyData);
        setLoading(false);
      }, 1000);
    };
    getBrands();
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
          data={offers} // Use Firestore data
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={({ item }) => (
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
                <Image
                  source={item.img } // Use URI for Firestore images
                  style={styles.image}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
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
