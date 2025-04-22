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
import { useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { getStyles } from './style';
import LinearGradient from 'react-native-linear-gradient';
import { RootState } from '../../../redux/store';
import { dummyDataList } from '../Home/BestSellers/dummyData';
import { languageData } from '../../../redux/language/languageSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import { Lock, Scope } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  // useEffect(() => {
  //   const getBrands = async () => {
  //     setLoading(true);
  //     const fetchedBrands = await fetchBrandsFromFirebase();
  //     setBrands(fetchedBrands);
  //     setLoading(false);
  //   };

  //   getBrands();
  // }, []);

  useEffect(() => {
      const getBrands = async () => {
        setLoading(true);
        // simulate delay
        setTimeout(() => {
          setBrands(dummyDataList);
          setLoading(false);
        }, 1000);
      };
      getBrands();
    }, []);

  const filteredData = brands.filter(item =>
    item.nameEng?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({
      ...prev,
      [id]: true,
    }));
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} translucent={true} animated={true} />
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
          {filteredData.length > 0 && !loading ? (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          ) : null}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder  visible={false}    LinearGradient={LinearGradient}  style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 20, marginBottom: 6 }} />
                    <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 15, marginBottom: 6 }} />
                    <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 15, width: 80 }} />
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
  const isLoaded = imageLoaded[item.id] || false;
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
                      <Image
                        source={{ uri: item.img }}
                        style={styles.itemImage}
                        onLoad={() => handleImageLoad(item.id)}
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
                        <Text style={styles.itemCity}>{item.selectedCity}</Text>
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
