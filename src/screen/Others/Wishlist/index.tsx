import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { toggleItemInCart } from '../../../redux/cartSlice';
import { Colors } from '../../../theme/Colors';
import { Dark_Heart, Light_Heart, NoDataFound } from '../../../theme/Images';
import { languageData } from '../../../redux/language/languageSlice';
import styles from './style';
import FastImage from 'react-native-fast-image';

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.language.language);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const isInCart = (itemId: string) =>
    cartItems.some(cartItem => cartItem.id === itemId);

  const handleToggleCart = (item: { id: string }) => {
    dispatch(toggleItemInCart(item));
  };

  const renderEmptyComponent = () => {
    const isLoading = cartItems === null || cartItems === undefined;

    return (
      <View style={styles.emptyContainer}>
        {isLoading ? (
          <>
            <Text style={styles.loadingText}>
              Data is loading, please wait…
            </Text>
            <ActivityIndicator
              size="large"
              color={Colors.PrimaryColor}
              style={{ marginTop: 20 }}
            />
          </>
        ) : (
          <>
            <Image
              source={NoDataFound}
              style={styles.noDataImage}
            />
            <Text style={styles.noDataText}>No data found</Text>
          </>
        )}
      </View>
    );
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.Flatlist_Cont}
      onPress={() => navigation.navigate('DetailScreen', { item })}>
      <FastImage source={{ uri: item.img }} style={styles.image}>
        <TouchableOpacity
          onPress={() => handleToggleCart(item)}
          style={styles.HeaderCont}>
          <Image
            source={isInCart(item.id) ? Dark_Heart : Light_Heart}
            style={styles.HeartStyle}
          />
        </TouchableOpacity>
      </FastImage>

      <Text style={styles.cate_txt}>
        {item.nameEng.length > 20
          ? item.nameEng.substring(0, 20) + '...'
          : item.nameEng}
      </Text>

      <View style={styles.Type_Cont}>
        <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
      </View>

      <View style={styles.Loc_Status_Cont}>
        <View style={styles.Loc_Cont} />
        <Text style={styles.Status_Txt}>
          {item.status === 'Active' ? 'Active' : 'In-active'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Bg }}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.Bg}
        barStyle="dark-content"
      />
      <View style={styles.container}>
        <Text style={styles.Header_Txt}>
          {languageData[language].Wishlist}
        </Text>

        <FlatList
          data={cartItems}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderWishlistItem}
        />
      </View>
    </SafeAreaView>
  );
};

export default WishlistScreen;
