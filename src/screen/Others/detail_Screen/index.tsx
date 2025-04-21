import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { getStyles } from './style';
import { RootState } from '../../../redux/store';
import { toggleItemInCart } from '../../../redux/cartSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import { languageData } from '../../../redux/language/languageSlice';
import { Dark_Heart, Light_Heart } from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';



const DetailScreen: React.FC<{route:any}> = ({route}) => {

  const {item} = route.params; // Home se data le rahe hain
  const dispatch = useDispatch();
  const latitude = item.latitude ? item.latitude : null;
  const longitude = item.longitude ? item.longitude : null;
  const phoneNumber = item.PhoneNumber;
  const navigation = useNavigation();
   const [imageLoading, setImageLoading] = useState(true);
  
   console.log("Fetched Offers:", item);

  // Redux Toolkit
   const language = useSelector((state: RootState) => state.language.language); 
    const styles = getStyles(language);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
  const handleToggleCart = () => {
    dispatch(toggleItemInCart(item));
  };
  


// Google Map and Mobile Number
  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };
  const Contact = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };
  // Google Map and Mobile Number

  const handleImageLoad = () => {
    setImageLoading(false); // Stop shimmer effect once the image has loaded
  };

  return (
    <SafeAreaView>
          <StatusBar hidden={true} translucent={true} animated={true} />
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.HeaderCont}>
            <CustomHeader
              title={languageData[language].Detail_Screen}
              onBackPress={() => {
                navigation.goBack();
              }}
            />
            <TouchableOpacity onPress={() =>{handleToggleCart()}}>
              {isInCart ? (
                <Image source={Dark_Heart} style={styles.HeartStyle} />
              ) : (
                <Image source={Light_Heart} style={styles.HeartStyle} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.Body_Cont}>
          <ShimmerPlaceholder
                visible={!imageLoading}
                LinearGradient={LinearGradient}
                style={styles.image}
              >
            <Image source={typeof item.img === 'string' ? { uri: item.img } : item.img} style={styles.image}    onLoad={handleImageLoad} />
            </ShimmerPlaceholder>
            <View style={styles.Type_Cont}>
              <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
            </View>
            <View style={styles.Title_Cont}>
              {language==='ar'?<Text style={styles.title}>{item.nameArabic}</Text>:
              <Text style={styles.title}>{item.nameEng}</Text>}
            
              
              <TouchableOpacity onPress={Contact} style={styles.call_cont}>
                <Image
                  source={require('../../../assets/icons/man.png')}
                  style={styles.Phone_Icon}
                />
                <Text style={styles.call_txt}>Call Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.Dis_Cont}>
              <Text style={styles.Discount}>{languageData[language].discount} </Text>
              <Text style={styles.Total_Discount}> {''+ item.discount +'%'}  </Text>
            </View>
            
              <View style={styles.Desc_Cont} >
              <Text style={styles.Desc}>{languageData[language].description}</Text>
              </View>
              {
                language==='ar'?<Text style={styles.Detail}>{item.descriptionArabic}</Text>:
                <Text style={styles.Detail}>{item.descriptionEng}</Text>
              }

          </View>

          <CustomButton  title="Redeem"   onPress={() => {Alert.alert('Redeem')}} />
          <View style={{marginBottom: Platform.OS === 'ios' ? '5%' : '4%'}} />
          <CustomButton
            title="Open Map"
            onPress={() => {
              handleOpenMaps();
            }}
          />
        </View>
       
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailScreen;
