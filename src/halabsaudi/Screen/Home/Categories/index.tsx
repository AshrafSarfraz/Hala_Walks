import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, ImageBackground, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { Text } from '../../../../ui/Text';
import { hbsText } from '../../../i18n/translations';
import { RootState } from '../../../redux_toolkit/store';
import { GAP, GUTTER } from '../../../Themes/Layout';
import { getStyles } from './style';

const images = [
  { id: '1', text: 'Food and Drink', category: 'Food & Drink', translationKey: 'ui_food_drink', source: require('../../../assets/Images/food__drinks.jpg') },
  { id: '2', text: 'Shop and Retail', category: 'Retail & Services', translationKey: 'ui_retail_services', source: require('../../../assets/Images/shop.png') },
  { id: '3', text: 'Beauty and Spa', category: 'Beauty spa & Fitness', translationKey: 'ui_beauty_spa_fitness', source: require('../../../assets/Images/beauty__spa.jpg') },
  { id: '5', text: 'Entertainment', category: 'Entertain ment', translationKey: 'ui_entertainment', source: require('../../../assets/Images/entertainment.png') },
  { id: '6', text: 'Hotel', category: 'Hotel', translationKey: 'ui_hotel', source: require('../../../assets/Images/hotel.png') },
];

type CategoriesProps = { navigation?: any };

const Categories: React.FC<CategoriesProps> = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const isAr = language === 'ar';

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={item => item.id}
        horizontal
        inverted={isAr}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: GUTTER }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('CategoriesScreen', { item })}>
            <ImageBackground source={item.source} imageStyle={styles.imageRadius} style={styles.image}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                style={styles.caption}>
                <Text style={styles.Txt} numberOfLines={2}>
                  {hbsText(isAr, item.translationKey as any)}
                </Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Categories;
