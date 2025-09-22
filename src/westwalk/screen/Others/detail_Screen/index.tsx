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
import FastImage from 'react-native-fast-image';
import Pin_Modal from '../../../components/Modal/CustomAlert/Pin_Modal';
import IncorrectPin from '../../../components/Modal/CustomAlert/IncorrectPin';




const DetailScreen: React.FC<{route: any}> = ({route}) => {
 
  const {item, source} = route.params; // Home se data le rahe hain
  const dispatch = useDispatch();
  const latitude = item.latitude ? item.latitude : null;
  const longitude = item.longitude ? item.longitude : null;
  const phoneNumber = item.PhoneNumber;
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);

  //New Feactures
  const [discountAlert, setdiscountAlert] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [incorrectPinModal, setIncorrectPinModal] = useState(false);
  const [showTimings, setShowTimings] = useState(false);


  // Redux Toolkit
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleToggleCart = () => {
    dispatch(toggleItemInCart(item));
  };
// redux

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const showAlert = () => {
    setAlertVisible(true);
  };
  const hideAlert = () => {
   setAlertVisible(false);
 };
  const showDiscount_Alert = () => {
   setdiscountAlert(true);
 };
  const hideDiscount_Alert = () => {
   setdiscountAlert(false);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
      <ScrollView showsVerticalScrollIndicator={false} > { source==='event'? (
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
             ( <Text style={styles.title1}>{item.nameEng}</Text> )}

          </View>
          <View style={styles.Loc_Cont1}>
            <Image  source={location} style={styles.Loc_Icon} />
            <Text style={styles.Loc_Txt}>{item.address} </Text>
          </View>

        
         </View>
           <View style={styles.Date_Cont} >
            <View style={styles.Start_date} >
             <Text style={styles.Date_txt} >Starting Date</Text>
              <Text style={styles.date} >{formatDate(item.startAt)}</Text>
            </View>
            <View style={styles.End_date} >
            <Text style={styles.Date_txt} >Ending Date</Text>
              <Text style={styles.date} >{formatDate(item.endAt)}</Text>
            </View>
           </View>
           <View style={styles.Desc_Cont}>
            <Text style={styles.Desc}>{languageData[language].description} </Text>
          </View>
          {language === 'ar' ? (  <Text style={styles.Detail}>{item.descriptionArabic}</Text> ) : ( <Text style={styles.Detail}>{item.descriptionEng}</Text> )}
         <CustomButton title={languageData[language].Call_Now} onPress={Contact} />
         </View> 
           ):
      (
        <View style={styles.container}>
        <View style={styles.HeaderCont}>
        <CustomHeader title={languageData[language].Detail_Screen} onBackPress={() => { navigation.goBack();}} />
          <TouchableOpacity onPress={() => { handleToggleCart(); }}>
            {isInCart ? ( <Image source={Dark_Heart} style={styles.HeartStyle} />  ) : ( <Image source={Light_Heart} style={styles.HeartStyle} />  )}
          </TouchableOpacity>
        </View>

        <View style={styles.Body_Cont}>
        <ShimmerPlaceholder visible={!imageLoading} LinearGradient={LinearGradient}  style={styles.image} >
          {Platform.OS==='ios'?
             <FastImage source={{ uri: item.img, priority:FastImage.priority.high}}
             style={styles.image}   onLoad={handleImageLoad} resizeMode='cover'    />:
             <Image source={{ uri: item.img}}
             style={styles.image}   onLoad={handleImageLoad} resizeMode='cover'    />
        }
          </ShimmerPlaceholder>

          <View style={styles.Type_Cont}>
          <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
          </View>

          <View style={styles.Title_Cont}>
           {language==='ar'?<Text style={styles.title}>{item.nameArabic}</Text>:
          <Text style={styles.title}>{item.nameEng}</Text>}


          <TouchableOpacity onPress={Contact} style={styles.call_cont}>
              <Image source={Phone}  style={styles.Phone_Icon} />
              <Text style={styles.call_txt}>{languageData[language].Call_Now}</Text>
          </TouchableOpacity>
          </View>
           <View style={styles.Loc_Cont}>
            <Image  source={location}  style={styles.Loc_Icon} />
            <Text style={styles.Loc_Txt}>{item.address} </Text>
          </View>

 {/* Working Hours */}
        <View style={{ marginTop: 5 }}>
        <TouchableOpacity onPress={() => setShowTimings(!showTimings)} style={styles.timing_dropdown}>
        <Text style={styles.working_hour_txt}> {languageData[language].workingHours || 'Working Hours'} </Text>
        <Text style={styles.dropdown_icon}>{showTimings ? '▲' : '▼'}</Text>
       </TouchableOpacity>

     {showTimings && item.timings && (
    <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 8, marginTop: 6 }}>
      {Object.entries(item.timings).map(([day, time]) => (
        <View key={day}style={styles.item_cont} >
          <Text style={{ textTransform: 'capitalize', fontSize: 15, color: '#333' }}>{day}</Text>
          <Text style={{ fontSize: 15, color: '#000' }}>{time}</Text>
        </View>
      ))}
    </View>
  )}
       </View>
       <View style={styles.Dis_Cont}>
  {item.isLimited ? (
    <View style={styles.Dis_txt_cont}>
      <Text style={styles.Total_Discount}>
        {item.isLimited }
      </Text>
    </View>
  ) : (
    <>
      <View style={styles.Dis_txt_cont}>
        <Text style={styles.Total_Discount}>
          {item.discount + '%'}
        </Text>
        <Text style={styles.Discount}>
          {languageData[language].discount}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.Menu_Btn}
        onPress={() => {
          const url = item.pdfUrl || item.menuUrl;

          if (url) {
            if (url.startsWith('http')) {
              Linking.openURL(url);
            } else {
              navigation.navigate('PDFViewerScreen', { pdfUrl: url });
            }
          } else {
            setModalVisible(true);
          }
        }}
      >
        <Text style={styles.menu_txt}>
          {item.selectedCategory?.toLowerCase() === 'food and drink'
            ? language === 'en'
              ? 'View Menu'
              : 'عرض القائمة'
            : item.selectedCategory?.toLowerCase() === 'shop and retail'
            ? language === 'en'
              ? 'View Products'
              : 'عرض المنتجات'
            : language === 'en'
            ? 'View Services'
            : 'عرض الخدمات'}
        </Text>
      </TouchableOpacity>
    </>
  )}
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
            showAlert();
          }}
        />
          <Pin_Modal
  visible={alertVisible}
  correctPin={item.pin}
  onSubmit={(userPin) => {
    if (userPin === item.pin) {
      openModal(item);
    } else {
     setIncorrectPinModal(true); // or use console.warn()
    }
    hideAlert(); // Close pin modal in both cases
  }}
  onClose={() => hideAlert()}
/>


{/* //  openModal(item); */}

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

<       IncorrectPin visible={incorrectPinModal} onClose={() => setIncorrectPinModal(false)}/>
      
     
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailScreen;
