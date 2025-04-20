import React, {  useState } from 'react';
import { View, Text, FlatList, TouchableOpacity,  Image, } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { getStyles } from './style';
import { RootState } from '../../../redux/store';



const images = [
  { id: '1', text: 'Food and Drink', category: 'Food and Drink', categoryArabic: 'المأكولات والمشروبات', source: require('../../../assets/images/food.png') },
  { id: '2', text: 'Beauty and Spa', category: 'Beauty and Spa',categoryArabic:  'الجمال والمنتجعات'  ,source: require('../../../assets/images/beauty.png') },
  { id: '3', text: 'Health and Fitness', category: 'Health and Fitness',categoryArabic:  'الصحة واللياقة' , source: require('../../../assets/images/health.png') },
  { id: '4', text: 'Fun and Leisure', category: 'Fun and Leisure', categoryArabic:  'الترفيه والتسلية' , source: require('../../../assets/images/fun.png') },
  { id: '5', text: 'Room Nights', category: 'Room Nights', categoryArabic:  'الإقامة الفندقية' , source: require('../../../assets/images/food.png') },
  { id: '6', text: 'Services and Retail', category: 'Services and Retail', categoryArabic:  'الخدمات والتجزئة' , source: require('../../../assets/images/food.png') },
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
            <Image source={item.source} style={styles.image}/>
            <Text style={styles.Txt} >{language==='en'? item.category:item.categoryArabic}</Text>
          </TouchableOpacity>
        )}
      />

    
    </View>
  );
};

export default Categories;
