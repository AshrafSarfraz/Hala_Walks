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

type VenuesProps = {
  navigation: any;
};

const Venues: React.FC<VenuesProps> = () => {
  const navigation = useNavigation();
  const [showAll, setShowAll] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
 

  const handleImageLoad = () => {
    setImageLoading(false); // Stop loader when image is loaded
  };

  const handleImageError = () => {
    setImageLoading(false); // Stop loader in case of error
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchVenuFromFirebase(); // 👈 use your logic here
      setVenues(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const visibleItems = showAll ? venues : venues.slice(0, 8);

  const renderShimmerItem = () => (
    <View style={styles.Flatlist_Cont}>
      {/* <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.image} />
      <View style={styles.bestSeller_Detail}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '80%', height: 20, marginBottom: 8, borderRadius: 5 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '100%', height: 15, borderRadius: 5 }} />
      </View> */}
    </View>
  );

  const renderVenueItem = ({ item, index }: { item: any ,index:any }) => {
    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('SelectedVenue', { item })}
      >
        {/* Shimmer effect for image */}
        <ShimmerPlaceholder visible={!imageLoading} LinearGradient={LinearGradient} style={styles.image}>
        <FastImage source={{ uri: item.img, priority: index <=6 ? FastImage.priority.high : index <= 10 ? FastImage.priority.normal : FastImage.priority.low }}
                 style={styles.image}  onLoad={handleImageLoad}    onError={handleImageError}  />
        </ShimmerPlaceholder>

        {/* Shimmer effect for venue name */}
        <ShimmerPlaceholder visible={!imageLoading} LinearGradient={LinearGradient} style={{ width: '80%',  marginTop: 2,  height: 20, borderRadius: 5, }}>
        {language==='en'? 
          <Text style={styles.cate_txt}>{item.venueName}</Text>:
          <Text style={styles.cate_txt}>{item.venueNameAr}</Text>}
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
        data={ visibleItems.filter(item => {
          if (countryName) {
            return item.country?.toLowerCase() === countryName.toLowerCase();
          }
          return true; // agar country detect na ho to sab items dikhao
        })}
        keyExtractor={item => item.id}
        numColumns={4}
        renderItem={renderVenueItem}
        ListEmptyComponent={renderShimmerItem} // Render shimmer effect when the list is empty
      />

      {venues.length > 8 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.showMoreText}>
            {showAll ? languageData[language].Hide :  languageData[language].Show_More}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Venues;
