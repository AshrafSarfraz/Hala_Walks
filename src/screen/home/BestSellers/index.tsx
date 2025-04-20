import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import { getStyles } from './style';
import { RootState } from '../../../redux/store';
import { dummyDataList } from './dummyData';


const BestSeller: React.FC = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{ [key: string]: boolean }>({});

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
        setBrands(dummyDataList.filter(item => item.isBestSeller === 'Yes'));
        setLoading(false);
      }, 1000);
    };
    getBrands();
  }, []);


  const handleCardLoad = (id: string) => setLoadedCards(prev => ({ ...prev, [id]: true }));
  const getDescription = (item: any) => (language === 'en' ? item.descriptionEng : item.descriptionArabic)?.substring(0, 60) + '...';

  const renderShimmerItem = () => (
    <View style={styles.Flatlist_Cont}>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.image} />
      <View style={styles.bestSeller_Detail}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '80%', height: 20, marginBottom: 8, borderRadius: 5 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '100%', height: 15, borderRadius: 5 }} />
      </View>
    </View>
  );

  const renderBrandItem = ({ item }: { item: any }) => {
    const isLoaded = loadedCards[item.id] ?? false;
    return (
      <TouchableOpacity style={styles.Flatlist_Cont} onPress={() => navigation.navigate('DetailScreen', { item })}>
        <View style={{ flexDirection: language==='en'?'row':"row-reverse", alignItems: 'center' }}>
          <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={styles.image}>
            <Image source={{ uri: item.img }} style={styles.image} onLoadEnd={() => handleCardLoad(item.id)} />
          </ShimmerPlaceholder>
          <View style={styles.bestSeller_Detail}>
            <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={{ width: '100%', height: 20, marginBottom: 2, borderRadius: 5 }}>
              <Text style={styles.title_txt}>{language === 'en' ? <Text>{item.nameEng.length > 16 ? item.nameEng.substring(0, 16) + '...' : item.nameEng}</Text> : item.nameArabic}</Text>
            </ShimmerPlaceholder>
            {!isLoaded ? (
              <>
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '100%', height: 15, borderRadius: 5, marginBottom: 5 }} />
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '90%', height: 15, borderRadius: 5, marginBottom: 5 }} />
              </>
            ) : (
              <Text style={styles.desc_txt}>{getDescription(item)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <FlatList
         data={[...Array(5).keys()]}
         horizontal 
         keyExtractor={item => item.toString()} 
         showsHorizontalScrollIndicator={false} 
         renderItem={renderShimmerItem} />
      ) : (
        <FlatList 
         data={brands}
         horizontal
         pagingEnabled 
         keyExtractor={item => item.id} 
         showsHorizontalScrollIndicator={false}
        renderItem={renderBrandItem} />
      )}
    </View>
  );
};

export default BestSeller;
