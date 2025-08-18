import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from '../../Themes/Images';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { firestore } from '../../firebase/firebaseconfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { Colors } from '../../Themes/Colors';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import FastImage from 'react-native-fast-image';

const SelectedVenues: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { item } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
    const [country, setCountry] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const snapshot = await firestore().collection('H-Brands').get();
        const BrandsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const matchedItems = BrandsData.filter(
          data => data.selectedVenue?.toLowerCase() === item.venueName?.toLowerCase(),
        );
        setFilteredItems(matchedItems);
      } catch (error) {
        console.error('❌ Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [item.text]);

  const handleImageLoad = (id: string) => {
    setImageLoaded((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const searchFiltered = filteredItems.filter(entry =>
    entry.nameEng?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
               <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader
          title={item.venueName}
          onBackPress={() => navigation.goBack()}
        />

        <View style={{ marginTop: '7%' }} />
        <View style={styles.searchContainer}>
          <Image source={Search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            placeholderTextColor={Colors.Grey9}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.FlatlistContainer}>
          {searchFiltered.length > 0 && (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          )}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder visible={false} LinearGradient={LinearGradient} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{ width: '70%', height: 16, borderRadius: 5, marginBottom: 6 }}
                    />
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{ width: '90%', height: 14, borderRadius: 5, marginBottom: 4 }}
                    />
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{ width: '40%', height: 12, borderRadius: 5 }}
                    />
                  </View>
                </View>
              )}
            />
          ) : searchFiltered.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={require('../../assets/Images/no_data.png')}
                style={styles.emptyStateImage}
              />
              <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
            </View>
          ) : (
            <FlatList
            data={
              searchFiltered.filter(item => {
                if (countryName) {
                  return item.selectedCountry?.toLowerCase() === countryName.toLowerCase();
                }
                return true; // agar country detect na ho to sab items dikhao
              })
            }
              keyExtractor={item => item.id}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item,index }) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('DetailScreen', { item })}
                >
                  <ShimmerPlaceholder
                    visible={imageLoaded[item.id] || false}
                    LinearGradient={LinearGradient}
                    style={styles.itemImage}
                  >
                     <FastImage source={{ uri: item.img, priority: index <=6 ? FastImage.priority.high : index <= 10 ? FastImage.priority.normal : FastImage.priority.low }}
                       style={styles.itemImage}   onLoad={() => handleImageLoad(item.id)}    />
                 
                  </ShimmerPlaceholder>

                
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>
                        {language === 'en' ? item.nameEng : item.nameArabic}
                      </Text>

                      <Text style={styles.itemLocation}>
                        {language === 'en'
                          ? item.descriptionEng?.length > 70
                            ? item.descriptionEng.substring(0, 70) + '...'
                            : item.descriptionEng
                          : item.descriptionArabic?.length > 70
                          ? item.descriptionArabic.substring(0, 70) + '...'
                          : item.descriptionArabic}
                      </Text>
                  
                      <Text style={styles.itemCity}>
                        {item.selectedCity}
                      </Text>
            
                    </View>
                  
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SelectedVenues;
