import React from 'react';
import {View, FlatList, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {RootState} from '../../../redux/store';
import {toggleItemInCart} from '../../../redux/cartSlice';
import OfferListCard from '../../../components/OfferListCard';
import ScreenHeader from '../../../components/header/ScreenHeader';
import {Text} from '../../../components/Text';
import {Colors} from '../../../theme/Colors';
import styles from './style';

export default function WishlistScreen() {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const items = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const count = items?.length ?? 0;
  const textAlign = ar ? 'right' : 'left';
  const rowDir = ar ? 'row-reverse' : 'row';

  const ListHeader = (
    <View style={styles.pageHeader}>
      <View style={[styles.titleRow, {flexDirection: rowDir}]}>
        <Text style={[styles.pageTitle, {textAlign}]}>
          {ar ? 'المفضلة' : 'Wishlist'}
        </Text>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.pageSubtitle, {textAlign}]}>
        {ar ? 'العروض التي قمت بحفظها' : 'Offers you have saved'}
      </Text>
      {count > 0 && <View style={styles.divider} />}
    </View>
  );

  const EmptyState = (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="heart-outline" size={44} color={Colors.PrimaryColor} />
      </View>
      <Text style={styles.emptyTitle}>
        {ar ? 'لا توجد عناصر محفوظة' : 'No saved items yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {ar
          ? 'اضغط على أيقونة القلب في أي عرض لحفظه هنا'
          : 'Tap the heart on any offer to save it here'}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.browseBtn}
        onPress={() => navigation.goBack()}>
        <Text style={styles.browseBtnText}>
          {ar ? 'تصفح العروض' : 'Browse offers'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + 100},
          count === 0 && styles.listContentEmpty,
        ]}
        renderItem={({item}) => (
          <OfferListCard
            item={item}
            ar={ar}
            onPress={() => navigation.navigate('DetailScreen', {item})}
            onRemove={() => dispatch(toggleItemInCart(item))}
          />
        )}
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
}
