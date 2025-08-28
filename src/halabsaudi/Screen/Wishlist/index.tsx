import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import styles from './style';
import {Dark_Heart, Light_Heart, Location} from '../../Themes/Images';
import {Colors} from '../../Themes/Colors'; // Import Colors
import {RootState} from '../../redux_toolkit/store'; // Adjust the path to your store file
import {toggleItemInCart} from '../../redux_toolkit/cartSlice';
import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';
import { languageData } from '../../redux_toolkit/language/languageSlice';

type WishlistProps = {
  navigation: any;
};

const Wishlist: React.FC<WishlistProps> = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux Toolkit: Get cart items from the store
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const language = useSelector((state: RootState) => state.language.language);

  // Check if an item is in the cart
  const isInCart = (itemId: string) =>
    cartItems.some(cartItem => cartItem.id === itemId);

  // Handle toggling (adding/removing) item in cart
  const handleToggleCart = (item: {id: string}) => {
    dispatch(toggleItemInCart(item)); // Dispatch action to add/remove from cart
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.Bg}}>
              <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />

      <View style={styles.container}>
        <Text style={styles.Header_Txt}>{languageData[language].Wishlist}</Text>

        {/* Render wishlist items */}
        <FlatList
          data={cartItems}
          keyExtractor={item => item.id}
          numColumns={2} // This specifies that the list will have 2 columns
          columnWrapperStyle={styles.row} // This will apply styles to each row (i.e., the items in each column)
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyStateContainer}>
              <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
              <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
           </View>
          )}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.Flatlist_Cont} // Make sure the items have the correct width in the row
              onPress={() => navigation.navigate('DetailScreen', {item})}>
              <ImageBackground source={{uri: item.img}} style={styles.image}>
                {/* Heart icon for toggling cart item */}
                <TouchableOpacity
                  onPress={() => handleToggleCart(item)}
                  style={styles.HeaderCont}>
                  {isInCart(item.id) ? (
                    <Image source={Dark_Heart} style={styles.HeartStyle} />
                  ) : (
                    <Image source={Light_Heart} style={styles.HeartStyle} />
                  )}
                </TouchableOpacity>
              </ImageBackground>
              <Text   style={[  styles.cate_txt ]}>  {item.nameEng.length > 20 ? item.nameEng.substring(0, 20) + '...' : item.nameEng}</Text>
              <View style={styles.Type_Cont}>
                <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
              </View>

              <View style={styles.Loc_Status_Cont}>
                <View style={styles.Loc_Cont}>
                  <Image source={Location} style={styles.LocationIcon} />
                  <DistanceFromDevice
                    targetLat={item.latitude}
                    targetLong={item.longitude}
                    kmText={languageData[language].km}
                    mText={languageData[language].m}
                    loadingText={languageData[language].Calculating}
                  />
                </View>
      
                  <Text style={styles.Status_Txt}>{item.selectedVenue}</Text>
       
            
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Wishlist;
