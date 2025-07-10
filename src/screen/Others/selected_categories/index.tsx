import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { getStyles } from './style';
import { RootState } from '../../../redux/store';
import { languageData } from '../../../redux/language/languageSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import { Scope } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import { fetchBrandsFromFirebase } from '../../../firebase/firebaseutils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SelectedCategories: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { item } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const getBrandsFromCache = async () => {
      try {
        setLoading(true);
        const cachedBrands = await AsyncStorage.getItem('brands_cache');
        if (cachedBrands) {
          const parsedBrands = JSON.parse(cachedBrands);
          const matchedItems = parsedBrands.filter(data =>
            data.selectedCategory?.toLowerCase() === item.text?.toLowerCase()
          );
          setFilteredItems(matchedItems);
        } else {
          console.warn('⚠️ No brands_cache found in AsyncStorage');
          setFilteredItems([]);
        }
      } catch (error) {
        console.error('❌ Error reading brands from AsyncStorage:', error);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };
  
    getBrandsFromCache();
  }, []);
  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  const searchFiltered = filteredItems.filter(entry =>
    entry.nameEng?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>
        {languageData[language].No_Items_Found}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.Bg}
        barStyle="dark-content"
      />
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader
          title={language === 'en' ? item.text : item.categoryArabic}
          onBackPress={() => navigation.goBack()}
        />

        <View style={{ marginTop: '7%' }} />

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <Image source={Scope} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData[language].Search_for_anything}
            placeholderTextColor={Colors.Grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List Header */}
        <View style={styles.FlatlistContainer}>
          {searchFiltered.length > 0 && !loading && (
            <Text style={styles.FoundItem_Txt}>
              {languageData[language].Found_Items}
            </Text>
          )}

          {/* Loading shimmer */}
          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder
                    visible={false}
                    LinearGradient={LinearGradient}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{ height: 20, marginBottom: 6 }}
                    />
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{ height: 15, marginBottom: 6 }}
                    />
                    <ShimmerPlaceholder
                      visible={false}
                      LinearGradient={LinearGradient}
                      style={{ height: 15, width: 80 }}
                    />
                  </View>
                </View>
              )}
            />
          ) : searchFiltered.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={searchFiltered}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isLoaded = imageLoaded[item.id] ?? false;

                return (
                  <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => navigation.navigate('DetailScreen', { item })}
                  >
                    {/* Image shimmer and loader */}
                    <ShimmerPlaceholder
                      visible={isLoaded}
                      LinearGradient={LinearGradient}
                      style={styles.itemImage}
                    >
                      <FastImage
                        source={{ uri: item.img }}
                        style={styles.itemImage}
                        resizeMode={FastImage.resizeMode.cover}
                        onLoad={() => handleImageLoad(item.id)}
                        onError={() => handleImageLoad(item.id)}
                      />
                    </ShimmerPlaceholder>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>
                        {language === 'en' ? item.nameEng : item.nameArabic}
                      </Text>
                      <Text style={styles.itemLocation}>
                        {language === 'en'
                          ? item.descriptionEng?.substring(0, 70) + '...'
                          : item.descriptionArabic?.substring(0, 70) + '...'}
                      </Text>
                      <Text style={styles.itemCity}>
                        {item.selectedCity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SelectedCategories;
