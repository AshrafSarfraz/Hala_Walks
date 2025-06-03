import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Linking,
  StatusBar,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {getStyles} from './style';
import {RootState} from '../../../redux/store';
import {toggleItemInCart} from '../../../redux/cartSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import {languageData} from '../../../redux/language/languageSlice';
import {Dark_Heart, Light_Heart, location, Phone} from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import {Colors} from '../../../theme/Colors';
import RedeemReceiptModal from '../../../components/Modal/StaffModal/RedeemModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RedeemReceiptModal2 from '../../../components/Modal/Tenant/RedeemModal2';
import RedeemReceiptModal3 from '../../../components/Modal/OrgEmp/RedeemModal3';




const DetailScreen: React.FC<{route: any}> = ({route}) => {
 
  const {item, source} = route.params; // Home se data le rahe hain
  const dispatch = useDispatch();
  const latitude = item.latitude ? item.latitude : null;
  const longitude = item.longitude ? item.longitude : null;
  const phoneNumber = item.PhoneNumber;
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);

  // Redux Toolkit
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const handleToggleCart = () => {
    dispatch(toggleItemInCart(item));
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };


  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };
  const Contact = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };
  const handleImageLoad = () => {
    setImageLoading(false); 
  };

    const [userType, setUserType] = useState<'staff' | 'tenant' | 'org' | null>(null);
    useEffect(() => {
      const getUserType = async () => {
        try {
          const staff = await AsyncStorage.getItem('staff_data');
          const tenant = await AsyncStorage.getItem('tenant_data');
          const org = await AsyncStorage.getItem('org_emp_data');
          if (staff) {
            setUserType('staff');
          } else if (tenant) {
            setUserType('tenant');
          } else if (org) {
            setUserType('org');
          }
        } catch (error) {
          console.error('Error reading AsyncStorage:', error);}};
         getUserType();
          }, []);

  return (
    <SafeAreaView>
      <StatusBar hidden={false} translucent={true}  animated={true} backgroundColor={Colors.Bg}  barStyle={'dark-content'}/>
      <ScrollView> { source==='event'? (
        <View style={styles.container}>
        <View style={styles.HeaderCont}>
          <CustomHeader  title={languageData[language].Detail_Screen} onBackPress={() => {  navigation.goBack(); }} />
        </View>

        <View style={styles.Body_Cont}> 
          <ShimmerPlaceholder visible={!imageLoading}  LinearGradient={LinearGradient}  style={styles.image}>
            <Image source={   typeof item.img === 'string' ? {uri: item.img} : item.img  } style={styles.image}  onLoad={handleImageLoad}  />
          </ShimmerPlaceholder>

          <View style={styles.Title_Cont}>
            {language === 'ar' ? (  <Text style={styles.title}>{item.nameArabic}</Text>) :
             ( <Text style={styles.title}>{item.nameEng}</Text> )}

          </View>
          <View style={styles.Loc_Cont}>
            <Image  source={location} style={styles.Loc_Icon} />
            <Text style={styles.Loc_Txt}>{item.Address} </Text>
          </View>

          <View style={styles.Desc_Cont}>
            <Text style={styles.Desc}>  {languageData[language].description} </Text>
          </View>
          {language === 'ar' ? (  <Text style={styles.Detail}>{item.descriptionArabic}</Text> ) : ( <Text style={styles.Detail}>{item.descriptionEng}</Text> )}
          </View>
           </View> ):
      (
        <View style={styles.container}>
        <View style={styles.HeaderCont}>
        <CustomHeader title={languageData[language].Detail_Screen} onBackPress={() => { navigation.goBack();}} />
          <TouchableOpacity onPress={() => { handleToggleCart(); }}>
            {isInCart ? ( <Image source={Dark_Heart} style={styles.HeartStyle} />  ) : ( <Image source={Light_Heart} style={styles.HeartStyle} />  )}
          </TouchableOpacity>
        </View>

        <View style={styles.Body_Cont}>
          <ShimmerPlaceholder  visible={!imageLoading} LinearGradient={LinearGradient} style={styles.image}>
            <Image source={   typeof item.img === 'string' ? {uri: item.img} : item.img  } style={styles.image} onLoad={handleImageLoad} />
          </ShimmerPlaceholder>

          <View style={styles.Type_Cont}>
            <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
          </View>

          <View style={styles.Title_Cont}>
            {language === 'ar' ? ( <Text style={styles.title}>{item.nameArabic}</Text>) : ( <Text style={styles.title}>{item.nameEng}</Text> )}

          <TouchableOpacity onPress={Contact} style={styles.call_cont}>
              <Image source={Phone}  style={styles.Phone_Icon} />
              <Text style={styles.call_txt}>{languageData[language].Call_Now}</Text>
          </TouchableOpacity>
          </View>
           <View style={styles.Loc_Cont}>
            <Image  source={location}  style={styles.Loc_Icon} />
            <Text style={styles.Loc_Txt}>{item.Address} </Text>
          </View>

          <View style={styles.Dis_Cont}>
            <View style={styles.Dis_txt_cont}>
              <Text style={styles.Total_Discount}>
                {' '}
                {'' + item.discount + '%'}{' '}
              </Text>
              <Text style={styles.Discount}>
                {languageData[language].discount}{' '}
              </Text>
            </View>

            <TouchableOpacity style={styles.Menu_Btn} onPress={() => {
          if (item.pdfUrl) {
            navigation.navigate('PDFViewerScreen', { pdfUrl: item.pdfUrl });
          } else { setModalVisible(true)}}}  >
               
                <Text style={styles.menu_txt} >{languageData[language].View_Menu}</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.Desc_Cont}>
            <Text style={styles.Desc}>
              {languageData[language].description}
            </Text>
          </View>
          {language === 'ar' ? (
            <Text style={styles.Detail}>{item.descriptionArabic}</Text>
          ) : (
            <Text style={styles.Detail}>{item.descriptionEng}</Text>
          )}
        </View>

        <CustomButton
          title={languageData[language].Redeem}
          onPress={() => {
            openModal(item);
          }}
        />

{userType==='staff' && (
        <RedeemReceiptModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          data={selectedItem}
        />
      )}

      {userType==='tenant' && (
        <RedeemReceiptModal2
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          data={selectedItem}
        />
      )}

      {userType==='org' && (
        <RedeemReceiptModal3
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          data={selectedItem}
        />
       
      )}
     


        <View style={{marginBottom: Platform.OS === 'ios' ? '5%' : '4%'}} />
        <CustomButton
          title={languageData[language].Open_Map}
          onPress={() => {
            handleOpenMaps();
          }}
        />
      </View>
      )}
     
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailScreen;
