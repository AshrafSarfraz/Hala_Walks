import React, { useState, useEffect } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';

import { getStyles } from './style';
import { RootState } from '../../../../redux/store';
import { fetchEventsFromFirebase } from '../../../../firebase/firebaseutils';

const { width } = Dimensions.get('screen');


const EventSlider: React.FC<{ navigation: any }> = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // 1️⃣ Load cached data FIRST
        const cachedData = await AsyncStorage.getItem('events');
  
        if (cachedData) {
          setOffers(JSON.parse(cachedData));
          setLoading(false); // 👈 FORAN UI SHOW
        }
  
        // 2️⃣ Fetch fresh data in BACKGROUND
        const freshOffers = await fetchEventsFromFirebase();
  
        // agar data different ho tab hi update karo
        if (JSON.stringify(freshOffers) !== cachedData) {
          setOffers(freshOffers);
          await AsyncStorage.setItem('events', JSON.stringify(freshOffers));
        }
  
        setLoading(false);
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
        onPress={() => navigation.navigate('DetailScreen', { item, source: 'event' })}
      >
        <ShimmerPlaceholder
          visible={isLoaded}
          LinearGradient={LinearGradient}
          style={styles.image}
        >
          {Platform.OS === 'ios' ? (
            <FastImage
              source={{ uri: item.img, priority: FastImage.priority.normal }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() => handleImageLoad(item.id)}
              onError={() => handleImageLoad(item.id)}
            />
          ) : (
            <Image
              source={{ uri: item.img }}
              style={styles.image}
              onLoad={() => handleImageLoad(item.id)}
              onError={() => handleImageLoad(item.id)}
            />
          )}
        </ShimmerPlaceholder>
      </TouchableOpacity>
    );
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
          data={offers}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default EventSlider;
