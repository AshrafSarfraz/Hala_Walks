import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Text} from '../../../../components/Text';
import {RootState} from '../../../../redux/store';
import {Colors} from '../../../../theme/Colors';
import {Fonts} from '../../../../theme/Fonts';
// Keep the existing category strings: the destination uses text to filter Brands.
const categories = [
  {
    id: '1',
    text: 'Food and Drink',
    category: 'Food & Drink',
    categoryArabic: 'المأكولات والمشروبات',
    source: require('../../../../assets/images/food_drinks.jpg'),
  },
  {
    id: '2',
    text: 'Retail and Services ',
    category: 'Retail & Services',
    categoryArabic: 'التجزئة والخدمات',
    source: require('../../../../assets/images/shop.png'),
  },
  {
    id: '3',
    text: 'Beauty and Spa',
    category: 'Beauty spa & Fitness',
    categoryArabic: 'منتجع تجميل ولياقة بدنية',
    source: require('../../../../assets/images/beauty_spa.jpg'),
  },
  {
    id: '4',
    text: 'Health and Fitness',
    category: 'Health and Fitness',
    categoryArabic: 'الصحة واللياقة',
    source: require('../../../../assets/images/health_fitness.png'),
  },
  {
    id: '5',
    text: 'Entertainment',
    category: 'Entertain ment',
    categoryArabic: 'الترفيه والتسلية',
    source: require('../../../../assets/images/entertainment.png'),
  },
];
export default function Categories({navigation}: {navigation: any}) {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  return (
    <FlatList
      data={categories}
      horizontal
      inverted={ar}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 16}}
      keyExtractor={c => c.id}
      renderItem={({item}) => (
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.card}
          onPress={() => navigation.navigate('CategoriesScreen', {item})}>
          <View style={styles.circle}>
            <Image source={item.source} style={styles.image} />
          </View>
          <Text numberOfLines={2} style={styles.label}>
            {ar ? item.categoryArabic : item.category}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
const styles = StyleSheet.create({
  card: {width: 76, marginRight: 8, alignItems: 'center'},
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.accentSoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {width: 54, height: 54, resizeMode: 'cover'},
  label: {
    fontSize: 11,
    fontFamily: Fonts.F_Medium,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 7,
    minHeight: 32,
  },
});
