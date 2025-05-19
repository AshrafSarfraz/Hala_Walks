import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { getStyles } from './style';
import { RootState } from '../../../../redux/store';
import { fetchBrandsFromFirebase, fetchFlatOfferFromFirebase } from '../../../../firebase/firebaseutils';


const { width } = Dimensions.get('screen');

const EventSlider: React.FC<{ navigation: any }> = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState<any[]>([]); // State to store Firestore data
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  useEffect(() => {
    const getFlatOffer = async () => {
      setLoading(true);
      const fetchedOffers = await fetchBrandsFromFirebase();
      setOffers(fetchedOffers);
      setLoading(false);
    };

    getFlatOffer();
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
                source={{uri: item.img}} // Use URI for Firestore images
                  style={styles.image}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </ShimmerPlaceholder>

               
            </TouchableOpacity>
          )}
        />
      )}

      {/* Pagination Dots */}
      {/* <View style={styles.pagination}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? "#31386A" : '#A2A2A2',
                width: index === currentIndex ? 30 : 8,
              },
            ]}
          />
        ))}
      </View> */}
    </View>
  );
};

export default EventSlider;
