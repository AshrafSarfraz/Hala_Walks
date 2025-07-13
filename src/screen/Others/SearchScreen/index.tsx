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
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { getStyles } from './style';
import { languageData } from '../../../redux/language/languageSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import { Scope } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import { fetchBrandsFromFirebase } from '../../../firebase/firebaseutils';
import { RootState } from '../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const getBrands = async () => {
      try {
        setLoading(true);
  
        const cached = await AsyncStorage.getItem('brands_cache');
        if (cached) {
          console.log('🗃️ Using cached brand data');
          setBrands(JSON.parse(cached));
        } else {
          console.warn('⚠️ No cache found, fetching from Firebase...');
          const fresh = await fetchBrandsFromFirebase();
          setBrands(fresh);
        }
      } catch (error) {
        console.error('❌ Error loading brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
  
    getBrands();
  }, []);
  
  

  const filteredData = brands.filter(item =>
    item.nameEng?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

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
        barStyle={'dark-content'}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader
          title={language === 'en' ? 'Search Screen' : 'شاشة البحث'}
          onBackPress={() => navigation.goBack()}
        />

        <View style={{ marginTop: '5%' }} />
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

        <View style={styles.FlatlistContainer}>
          {filteredData.length > 0 && !loading && (
            <Text style={styles.FoundItem_Txt}>
              {languageData[language].Found_Items}
            </Text>
          )}

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
          ) : filteredData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={item => item.id}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isLoaded = imageLoaded[item.id] ?? false;

                return (
                  <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => navigation.navigate('DetailScreen', { item })}
                  >
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
                          ? item.descriptionEng?.length > 70
                            ? item.descriptionEng.substring(0, 70) + '...'
                            : item.descriptionEng
                          : item.descriptionArabic?.length > 70
                          ? item.descriptionArabic.substring(0, 70) + '...'
                          : item.descriptionArabic}
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

export default SearchScreen;
