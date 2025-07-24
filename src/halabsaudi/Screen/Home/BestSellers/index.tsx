import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image'

import { fetchBrandsFromFirebase } from '../../../firebase/firebaseutils';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';

const { width } = Dimensions.get('screen');

const BestSeller: React.FC = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [brands, setBrands] = useState<any[]>([]);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedCards, setLoadedCards] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const getBrands = async () => {
      setLoading(true);
      const fetchedBrands = await fetchBrandsFromFirebase();
      setBrands(fetchedBrands);
      setLoading(false);
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

  const renderBrandItem = ({ item,index }: { item: any,index:number }) => {
    const isLoaded = loadedCards[item.id] ?? false;
    return (
      <TouchableOpacity style={styles.Flatlist_Cont} onPress={() => navigation.navigate('DetailScreen', { item })}>
        <View style={{ flexDirection: language==='en'?'row':"row-reverse", alignItems: 'center' }}>
          <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={styles.image}>
          <FastImage source={{ uri: item.img, priority: index === 0 ? FastImage.priority.high : index <= 2 ? FastImage.priority.normal : FastImage.priority.low }}
           style={styles.image} onLoadEnd={() => handleCardLoad(item.id)} />
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
        data={
          brands.filter(item => {
            if (country) {
              return item.selectedCountry?.toLowerCase() === country.toLowerCase();
            }
            return true; // agar country detect na ho to sab items dikhao
          })
        }
         horizontal
         pagingEnabled 
         keyExtractor={item => item.id} 
         showsHorizontalScrollIndicator={false}
        renderItem={renderBrandItem} />
      )}
      <DetectCountry onCountryDetect={(value) => setCountry(value)} />
    </View>
  );
};

export default BestSeller;
