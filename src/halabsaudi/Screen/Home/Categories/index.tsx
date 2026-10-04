import type { NavigationProp,ParamListBase } from '@react-navigation/native';
import React,{ useState } from 'react';
import { FlatList,ImageBackground,TouchableOpacity,View } from 'react-native';
import { Text } from '../../../../ui/Text';

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';



import { hbsText } from '../../../i18n/translations';

const images = [
  { id: '1', text: 'Food and Drink', category: 'Food & Drink', translationKey: 'ui_food_drink', source: require('../../../assets/Images/food__drinks.jpg') },
  { id: '2', text: 'Shop and Retail', category: 'Retail & Services', translationKey: 'ui_retail_services' , source: require('../../../assets/Images/shop.png') },
  { id: '3', text: 'Beauty and Spa', category: 'Beauty spa & Fitness',translationKey: 'ui_beauty_spa_fitness'  ,source: require('../../../assets/Images/beauty__spa.jpg') },
  // { id: '4', text: 'Health and Fitness', category: 'Health and Fitness',categoryArabic:  'الصحة واللياقة' , source: require('../../../assets/Images/health_fitness.png') },
  { id: '5', text: 'Entertainment', category: 'Entertain ment', translationKey: 'ui_entertainment' , source: require('../../../assets/Images/entertainment.png') },
  { id: '6', text: 'Hotel', category: 'Hotel', translationKey: 'ui_hotel' , source: require('../../../assets/Images/hotel.png') },
 
  // { id: '7', text: 'Services', category: 'Services', categoryArabic:  'الخدمات والتجزئة' , source: require('../../../assets/Images/services.png') },

];


type CategoriesProps={
  navigation: any
  
}

const Categories:React.FC<CategoriesProps> = () => {
  const navigation=useNavigation<NavigationProp<ParamListBase>>()
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  return (
    <View style={styles.container}>
      {/* Image Slider */}
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity  style={styles.Flatlist_Cont} onPress={() => navigation.navigate('CategoriesScreen', { item })}>
            <ImageBackground source={item.source}  imageStyle={{borderRadius:10}} style={styles.image}>
            <View style={styles.caption}><Text style={styles.Txt} >{hbsText(language === 'ar', item.translationKey as any)}</Text></View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />

    
    </View>
  );
};

export default Categories;
