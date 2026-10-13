import React from 'react';
import {View, FlatList} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {toggleItemInCart} from '../../../redux/cartSlice';
import OfferListCard from '../../../components/OfferListCard';
import ScreenHeader from '../../../components/header/ScreenHeader';
import {Text} from '../../../components/Text';
import {Colors} from '../../../theme/Colors';
export default function WishlistScreen() {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const items = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <View style={{flex: 1, backgroundColor: Colors.White}}>
      <ScreenHeader title={ar ? 'المفضلة' : 'Wishlist'} />
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
        renderItem={({item}) => (
          <OfferListCard
            item={item}
            ar={ar}
            onPress={() => navigation.navigate('DetailScreen', {item})}
            onRemove={() => dispatch(toggleItemInCart(item))}
          />
        )}
        ListEmptyComponent={
          <Text
            style={{textAlign: 'center', paddingTop: 80, color: Colors.Grey}}>
            {ar ? 'لا توجد عناصر محفوظة' : 'No saved items yet'}
          </Text>
        }
      />
    </View>
  );
}
