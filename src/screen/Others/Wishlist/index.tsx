// import React from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   ImageBackground,
// } from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {useDispatch, useSelector} from 'react-redux';
// import styles from './style';
// import {Dark_Heart, Light_Heart, Location} from '../../Themes/Images';
// import {Colors} from '../../Themes/Colors'; // Import Colors
// import {RootState} from '../../redux_toolkit/store'; // Adjust the path to your store file
// import {toggleItemInCart} from '../../redux_toolkit/cartSlice';
// import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';

// type WishlistProps = {
//   navigation: any;
// };

// const Wishlist: React.FC<WishlistProps> = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   // Redux Toolkit: Get cart items from the store
//   const cartItems = useSelector((state: RootState) => state.cart.items);

//   // Check if an item is in the cart
//   const isInCart = (itemId: string) =>
//     cartItems.some(cartItem => cartItem.id === itemId);

//   // Handle toggling (adding/removing) item in cart
//   const handleToggleCart = (item: {id: string}) => {
//     dispatch(toggleItemInCart(item)); // Dispatch action to add/remove from cart
//   };

//   return (
//     <SafeAreaView style={{flex: 1, backgroundColor: Colors.Bg}}>
//       {/* StatusBar fix for iOS */}
//       {/* <StatusBar
//         barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
//         translucent={Platform.OS === 'android'}
//         backgroundColor={Platform.OS === 'android' ? Colors.Bg : 'transparent'}
//       /> */}
//         <StatusBar hidden={true} translucent={true} animated={true} />

//       <View style={styles.container}>
//         <Text style={styles.Header_Txt}>Wishlist</Text>

//         {/* Render wishlist items */}
//         <FlatList
//           data={cartItems}
//           keyExtractor={item => item.id}
//           numColumns={2} // This specifies that the list will have 2 columns
//           columnWrapperStyle={styles.row} // This will apply styles to each row (i.e., the items in each column)
//           showsVerticalScrollIndicator={false}
//           renderItem={({item}) => (
//             <TouchableOpacity
//               style={styles.Flatlist_Cont} // Make sure the items have the correct width in the row
//               onPress={() => navigation.navigate('DetailScreen', {item})}>
//               <ImageBackground source={{uri: item.img}} style={styles.image}>
//                 {/* Heart icon for toggling cart item */}
//                 <TouchableOpacity
//                   onPress={() => handleToggleCart(item)}
//                   style={styles.HeaderCont}>
//                   {isInCart(item.id) ? (
//                     <Image source={Dark_Heart} style={styles.HeartStyle} />
//                   ) : (
//                     <Image source={Light_Heart} style={styles.HeartStyle} />
//                   )}
//                 </TouchableOpacity>
//               </ImageBackground>
//               <Text   style={[  styles.cate_txt ]}>  {item.nameEng.length > 20 ? item.nameEng.substring(0, 20) + '...' : item.nameEng}</Text>
//               <View style={styles.Type_Cont}>
//                 <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
//               </View>

//               <View style={styles.Loc_Status_Cont}>
//                 <View style={styles.Loc_Cont}>
//                   <Image source={Location} style={styles.LocationIcon} />
//                   <DistanceFromDevice
//                     targetLat={item.latitude}
//                     targetLong={item.longitude}
//                     kmText="km away"
//                     mText="m away"
//                     loadingText="Calculating..."
//                   />
//                 </View>
//                 {item.status === 'Yes' ? (
//                   <Text style={styles.Status_Txt}>Active</Text>
//                 ) : (
//                   <Text style={styles.Status_Txt}>In-active</Text>
//                 )}
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Wishlist;
