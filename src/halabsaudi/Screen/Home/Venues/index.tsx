import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import { styles } from './style';
import { fetchVenuFromFirebase } from '../../../firebase/firebaseutils';
import FastImage from 'react-native-fast-image';
import { RootState } from '../../../redux_toolkit/store';
import { useSelector } from 'react-redux';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VenuesProps = {
  navigation: any;
};

const Venues: React.FC = () => {
  const navigation = useNavigation();
  const [showAll, setShowAll] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('H-venus_cache');
        if (cachedData) {
          setVenues(JSON.parse(cachedData));
          setLoading(false);
        }

        const freshOffers = await fetchVenuFromFirebase();
        if (freshOffers.length > 0) {
          setVenues(freshOffers);
          await AsyncStorage.setItem('H-venus_cache', JSON.stringify(freshOffers));
        }
      } catch (error) {
        console.error('Error loading venues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  const filteredVenues = React.useMemo(() => {
    return venues.filter(item => {
      if (countryName) {
        return item.country?.toLowerCase() === countryName.toLowerCase();
      }
      return true;
    });
  }, [venues, countryName]);

  const visibleItems = showAll ? filteredVenues : filteredVenues.slice(0, 8);

  const renderVenueItem = ({ item, index }: { item: any; index: number }) => {
    const isLoaded = imageLoaded[item.id] || false;

    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('SelectedVenue', { item })}
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
                index <= 6
                  ? FastImage.priority.high
                  : index <= 10
                  ? FastImage.priority.normal
                  : FastImage.priority.low,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
            onLoad={() => handleImageLoad(item.id)}
          />
        </ShimmerPlaceholder>

        <ShimmerPlaceholder
          visible={isLoaded}
          LinearGradient={LinearGradient}
          style={{ width: '80%', marginTop: 2, height: 20, borderRadius: 5 }}
        >
          <Text style={styles.cate_txt}>
            {language === 'en' ? item.venueName : item.venueNameAr}
          </Text>
        </ShimmerPlaceholder>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="gray" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleItems}
        keyExtractor={item => item.id}
        numColumns={4}
        renderItem={renderVenueItem}
        showsVerticalScrollIndicator={false}
      />

      {filteredVenues.length > 8 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.showMoreText}>
            {showAll ? languageData[language].Hide : languageData[language].Show_More}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


export default Venues;
