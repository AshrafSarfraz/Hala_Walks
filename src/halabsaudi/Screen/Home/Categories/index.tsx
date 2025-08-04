import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ImageBackground, } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';



const images = [
  { id: '1', text: 'Food and Drink', category: 'Food and Drink', categoryArabic: 'المأكولات والمشروبات', source: require('../../../assets/Images/food__drinks.jpg') },
  { id: '2', text: 'Shop and Retail', category: 'Shop and Retail', categoryArabic:  'الخدمات والتجزئة' , source: require('../../../assets/Images/shop.png') },
  { id: '3', text: 'Beauty and Spa', category: 'Beauty and Spa',categoryArabic:  'الجمال والمنتجعات'  ,source: require('../../../assets/Images/beauty__spa.jpg') },
  { id: '4', text: 'Health and Fitness', category: 'Health and Fitness',categoryArabic:  'الصحة واللياقة' , source: require('../../../assets/Images/health_fitness.png') },
  { id: '5', text: 'Entertainment', category: 'Entertain ment', categoryArabic:  'الترفيه والتسلية' , source: require('../../../assets/Images/entertainment.png') },
  { id: '6', text: 'Hotel', category: 'Hotel', categoryArabic:  'الإقامة الفندقية' , source: require('../../../assets/Images/hotel.png') },
  { id: '7', text: 'Services', category: 'Services', categoryArabic:  'الخدمات والتجزئة' , source: require('../../../assets/Images/services.png') },
];


type CategoriesProps={
  navigation: any
  
}

const Categories:React.FC<CategoriesProps> = () => {
  const navigation=useNavigation()
  const [currentIndex, setCurrentIndex] = useState(0);
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  return (
    <View style={styles.container}>
      {/* Image Slider */}
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity  style={styles.Flatlist_Cont} onPress={() => navigation.navigate('CategoriesScreen', { item })}>
            <ImageBackground source={item.source}  imageStyle={{borderRadius:10}} style={styles.image}>
            <Text style={styles.Txt} >{language==='en'? item.category:item.categoryArabic}</Text>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />

    
    </View>
  );
};

export default Categories;
