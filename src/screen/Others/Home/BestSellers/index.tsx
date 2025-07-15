import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { getStyles } from './style';
import { RootState } from '../../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BestSeller: React.FC = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getBrandsFromCache = async () => {
      try {
        setLoading(true);
        const cachedBrands = await AsyncStorage.getItem('brands_cache');
        if (cachedBrands) {
          const parsedBrands = JSON.parse(cachedBrands);
          const bestSellers = parsedBrands.filter((item: any) => item.isBestSeller === "yes");
          setBrands(bestSellers);
        } else {
          console.warn('⚠️ No brands_cache found in AsyncStorage');
          setBrands([]);
        }
      } catch (error) {
        console.error("❌ Error reading brands from AsyncStorage:", error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
  
    getBrandsFromCache();
  }, []);

  const getDescription = (item: any) =>
    (language === 'en' ? item.descriptionEng : item.descriptionArabic)?.substring(0, 60) + '...';

  const renderShimmerItem = () => (
    <View style={styles.Flatlist_Cont}>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.image} />
      <View style={styles.bestSeller_Detail}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '80%', height: 20, marginBottom: 8, borderRadius: 5 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '100%', height: 15, borderRadius: 5 }} />
      </View>
    </View>
  );

  const renderBrandItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.Flatlist_Cont} onPress={() => navigation.navigate('DetailScreen', { item })}>
      <View style={{ flexDirection: language === 'en' ? 'row' : 'row-reverse', alignItems: 'center' }}>
        <FastImage
          source={{ uri: item.img, priority: FastImage.priority.normal }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.bestSeller_Detail}>
          <Text style={styles.title_txt}>
            {language === 'en'
              ? item.nameEng?.length > 16
                ? item.nameEng.substring(0, 16) + '...'
                : item.nameEng
              : item.nameArabic}
          </Text>
          <Text style={styles.desc_txt}>{getDescription(item)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <FlatList
          data={[...Array(5).keys()]}
          horizontal
          keyExtractor={(item) => item.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={renderShimmerItem}
        />
      ) : (
        <FlatList
          data={brands}
          horizontal
          pagingEnabled
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={renderBrandItem}
        />
      )}
    </View>
  );
};

export default BestSeller;
