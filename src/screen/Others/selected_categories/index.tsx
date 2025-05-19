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

import { useSelector } from 'react-redux';
import { getStyles } from './style';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../../redux/store';
import { dummyDataList } from '../Home/BestSellers/dummyData';
import { languageData } from '../../../redux/language/languageSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import { Scope } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import { fetchBrandsFromFirebase } from '../../../firebase/firebaseutils';

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
    const getBrands = async () => {
      setLoading(true);
      const fetchedBrands = await fetchBrandsFromFirebase();
      const matchedItems = fetchedBrands.filter(data =>
        data.selectedCategory?.toLowerCase() === item.text?.toLowerCase(),
      );
      setFilteredItems(matchedItems);
      setLoading(false);
    };

    getBrands();
  }, []);

 

  const handleImageLoad = (id: string) => {
    setImageLoaded((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const searchFiltered = filteredItems.filter(entry =>
    entry.nameEng?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      {/* <Image source={require('../../Assests/Images/no_data.png')} style={styles.emptyStateImage} /> */}
      <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.Bg} barStyle={'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        {
          language==='en'? <CustomHeader title={item.text} onBackPress={() => navigation.goBack()} />:
          <CustomHeader title={item.categoryArabic} onBackPress={() => navigation.goBack()} />
        }
       
      
        <View style={{ marginTop: '7%' }} />
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
          {searchFiltered.length > 0 && !loading ? (
            <Text style={styles.FoundItem_Txt}>{languageData[language].Found_Items}</Text>
          ) : null}

          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => (
                <View style={styles.itemContainer}>
                  <ShimmerPlaceholder visible={false} LinearGradient={LinearGradient}  style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 20, marginBottom: 6 }} />
                    <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 15, marginBottom: 6 }} />
                    <ShimmerPlaceholder visible={false}    LinearGradient={LinearGradient} style={{ height: 15, width: 80 }} />
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
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isLoaded = imageLoaded[item.id] || false;

                return (
                  <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => navigation.navigate('DetailScreen', { item })}
                  >
                    {/* IMAGE shimmer */}
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

                    {/* TEXT shimmer */}
           
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
